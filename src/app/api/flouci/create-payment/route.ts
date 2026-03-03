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

  const payload: Record<string, unknown> = {
    amount,
    success_link: successUrl,
    fail_link: failUrl,
    webhook: webhookUrl,
  };

  if (destinationId) {
    payload.destination = [
      {
        amount,
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

  if (!flouciResponse.ok) {
    return NextResponse.json(
      {
        error: 'Flouci initialization failed',
        details: data,
        status: flouciResponse.status,
      },
      { status: flouciResponse.status }
    );
  }

  if (
    data &&
    typeof data === 'object' &&
    (data as { result?: { success?: boolean } })?.result?.success === false
  ) {
    return NextResponse.json(
      {
        error: 'Flouci initialization failed',
        details: (data as { result?: unknown }).result,
        status: 400,
      },
      { status: 400 }
    );
  }

  return NextResponse.json(data);
}
