import { NextResponse } from 'next/server';

type CreatePaymentBody = {
  amount: number;
  currency?: string;
  orderId?: string;
  successUrl?: string;
  failUrl?: string;
  customer?: {
    email?: string;
    phone?: string;
  };
  metadata?: Record<string, string | number | boolean>;
};

export async function POST(request: Request) {
  const appId = process.env.FLOUCI_PUBLIC_KEY;
  const appSecret = process.env.FLOUCI_SECRET_KEY;
  const baseUrlOverride = process.env.FLOUCI_BASE_URL;
  const allowMetadata = process.env.FLOUCI_ALLOW_METADATA === 'true';

  if (!appId || !appSecret) {
    return NextResponse.json(
      { error: 'Missing FLOUCI_PUBLIC_KEY or FLOUCI_SECRET_KEY' },
      { status: 500 }
    );
  }

  let body: CreatePaymentBody;
  try {
    body = (await request.json()) as CreatePaymentBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const amount = Number(body?.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }
  const amountInMillimes = Math.round(amount);

  const currency = typeof body?.currency === 'string' ? body.currency : 'TND';
  if (currency !== 'TND') {
    return NextResponse.json({ error: 'Unsupported currency' }, { status: 400 });
  }

  const origin = baseUrlOverride || new URL(request.url).origin;
  const successUrl =
    typeof body?.successUrl === 'string' && body.successUrl.length > 0
      ? body.successUrl
      : `${origin}/payment/success`;
  const failUrl =
    typeof body?.failUrl === 'string' && body.failUrl.length > 0
      ? body.failUrl
      : `${origin}/payment/fail`;
  const webhookUrl = `${origin}/api/flouci/webhook`;

  if (body?.orderId && body.orderId.length > 50) {
    return NextResponse.json(
      { error: 'developer_tracking_id is too long' },
      { status: 400 }
    );
  }

  const basePayload: Record<string, unknown> = {
    amount: amountInMillimes,
    success_link: successUrl,
    fail_link: failUrl,
    webhook: webhookUrl,
    session_timeout_secs: 1200,
  };

  if (body?.orderId) {
    basePayload.developer_tracking_id = body.orderId;
  }

  const payloadWithMetadata: Record<string, unknown> = {
    ...basePayload,
    ...(allowMetadata && body?.metadata && typeof body.metadata === 'object'
      ? { metadata: body.metadata }
      : {}),
  };


  const callV2 = async (payload: Record<string, unknown>) => {
    const response = await fetch(
      'https://developers.flouci.com/api/v2/generate_payment',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${appId}:${appSecret}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const rawText = await response.text();
    let parsed: unknown = null;
    try {
      parsed = rawText ? JSON.parse(rawText) : null;
    } catch {
      parsed = { raw: rawText };
    }

    const failed =
      !response.ok ||
      (parsed &&
        typeof parsed === 'object' &&
        (parsed as { result?: { success?: boolean } })?.result?.success ===
          false);

    return { response, parsed, failed };
  };

  let attemptPayload = payloadWithMetadata;
  let flouciResult = await callV2(attemptPayload);
  let v2Attempts: Array<Record<string, unknown>> = [
    { payload: attemptPayload, result: flouciResult.parsed },
  ];

  if (flouciResult.failed && allowMetadata && payloadWithMetadata.metadata) {
    attemptPayload = { ...basePayload };
    flouciResult = await callV2(attemptPayload);
    v2Attempts.push({ payload: attemptPayload, result: flouciResult.parsed });
  }

  if (flouciResult.failed && attemptPayload.webhook) {
    const { webhook, ...payloadWithoutWebhook } = attemptPayload;
    flouciResult = await callV2(payloadWithoutWebhook);
    v2Attempts.push({
      payload: payloadWithoutWebhook,
      result: flouciResult.parsed,
    });
  }
  const debugPayload = {
    amount: amountInMillimes,
    success_link: successUrl,
    fail_link: failUrl,
    webhook: webhookUrl,
    developer_tracking_id: body?.orderId || null,
    session_timeout_secs: 1200,
    metadata: allowMetadata ? body?.metadata || null : null,
  };

  if (flouciResult.failed) {
    const legacyPayload: Record<string, unknown> = {
      amount: amountInMillimes,
      currency,
      success_url: successUrl,
      fail_url: failUrl,
    };

    if (body?.metadata && typeof body.metadata === 'object') {
      legacyPayload.metadata = body.metadata;
    }

    if (body?.customer && typeof body.customer === 'object') {
      legacyPayload.customer = body.customer;
    }

    const legacyResponse = await fetch(
      'https://api.flouci.com/payments/init',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-app-id': appId,
          'x-app-secret': appSecret,
        },
        body: JSON.stringify(legacyPayload),
      }
    );

    const legacyText = await legacyResponse.text();
    let legacyData: unknown = null;
    try {
      legacyData = legacyText ? JSON.parse(legacyText) : null;
    } catch {
      legacyData = { raw: legacyText };
    }

    if (legacyResponse.ok) {
      return NextResponse.json(legacyData);
    }

    return NextResponse.json(
      {
        error: 'Flouci initialization failed',
        details: {
          v2Attempts,
          legacy: legacyData,
        },
        detailsText: JSON.stringify({ v2Attempts, legacy: legacyData }),
        payload: debugPayload,
        status: flouciResult.response.status,
        legacyDetails: legacyData,
      },
      { status: flouciResult.response.status || 400 }
    );
  }

  return NextResponse.json(flouciResult.parsed);
}
