import { NextResponse } from 'next/server';

type Params = { paymentId: string };

export async function GET(
  _request: Request,
  context: { params: Params }
) {
  const appId = process.env.FLOUCI_PUBLIC_KEY;
  const appSecret = process.env.FLOUCI_SECRET_KEY;

  if (!appId || !appSecret) {
    return NextResponse.json(
      { error: 'Missing FLOUCI_PUBLIC_KEY or FLOUCI_SECRET_KEY' },
      { status: 500 }
    );
  }

  const paymentId = context.params.paymentId;
  if (!paymentId) {
    return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 });
  }

  const response = await fetch(
    `https://developers.flouci.com/api/v2/verify_payment/${paymentId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${appId}:${appSecret}`,
      },
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
        error: 'Flouci verify failed',
        details: data,
        status: response.status,
      },
      { status: response.status }
    );
  }

  return NextResponse.json(data);
}
