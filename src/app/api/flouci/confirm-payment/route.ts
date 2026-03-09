import { NextResponse } from 'next/server';

type ConfirmPaymentBody = {
  paymentId?: string;
};

export async function POST(request: Request) {
  const appId = process.env.FLOUCI_PUBLIC_KEY;
  const appSecret = process.env.FLOUCI_SECRET_KEY;

  if (!appId || !appSecret) {
    return NextResponse.json(
      { error: 'Missing FLOUCI_PUBLIC_KEY or FLOUCI_SECRET_KEY' },
      { status: 500 }
    );
  }

  let body: ConfirmPaymentBody;
  try {
    body = (await request.json()) as ConfirmPaymentBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const paymentId = body?.paymentId;
  if (!paymentId) {
    return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 });
  }

  const response = await fetch(
    'https://developers.flouci.com/api/v2/confirm_payment',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${appId}:${appSecret}`,
      },
      body: JSON.stringify({ payment_id: paymentId }),
    }
  );

  const rawText = await response.text();
  let data: unknown = null;
  try {
    data = rawText ? JSON.parse(rawText) : null;
  } catch {
    data = { raw: rawText };
  }

  if (!response.ok) {
    return NextResponse.json(
      {
        error: 'Flouci confirm failed',
        details: data,
        status: response.status,
      },
      { status: response.status }
    );
  }

  return NextResponse.json(data);
}
