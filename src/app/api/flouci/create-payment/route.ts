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
  const destinationId = process.env.FLOUCI_MERCHANT_ID;
  const baseUrlOverride = process.env.FLOUCI_BASE_URL;

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

  if (destinationId && !/^\d+$/.test(destinationId)) {
    return NextResponse.json(
      { error: 'Invalid FLOUCI_MERCHANT_ID format' },
      { status: 400 }
    );
  }

  const payload: Record<string, unknown> = {
    amount: amountInMillimes,
    success_link: successUrl,
    fail_link: failUrl,
    webhook: webhookUrl,
  };

  if (destinationId) {
    payload.destination = [
      {
        amount: amountInMillimes,
        destination: destinationId,
      },
    ];
  }

  if (body?.orderId) {
    payload.developer_tracking_id = body.orderId;
  }

  if (body?.metadata && typeof body.metadata === 'object') {
    payload.metadata = body.metadata;
  }


  const flouciResponse = await fetch(
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

  const rawText = await flouciResponse.text();
  let data: unknown = null;

  try {
    data = rawText ? JSON.parse(rawText) : null;
  } catch {
    data = { raw: rawText };
  }

  const debugPayload = {
    amount: amountInMillimes,
    success_link: successUrl,
    fail_link: failUrl,
    webhook: webhookUrl,
    developer_tracking_id: body?.orderId || null,
    destination: destinationId
      ? [{ amount: amountInMillimes, destination: destinationId }]
      : null,
  };

  const v2Failed =
    !flouciResponse.ok ||
    (data &&
      typeof data === 'object' &&
      (data as { result?: { success?: boolean } })?.result?.success === false);

  if (v2Failed) {
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
        details: data,
        payload: debugPayload,
        status: flouciResponse.status,
        legacyDetails: legacyData,
      },
      { status: flouciResponse.status || 400 }
    );
  }

  return NextResponse.json(data);
}
