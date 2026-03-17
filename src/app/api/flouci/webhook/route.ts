import { timingSafeEqual, createHmac } from 'crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type WebhookPayload = Record<string, unknown>;

const getHeaderSafe = (value: string | null) => (value ? value : '');

const normalizeStatus = (value: string) => {
  const normalized = value.toLowerCase();
  if (
    normalized.includes('success') ||
    normalized.includes('paid') ||
    normalized.includes('completed')
  ) {
    return 'completed';
  }
  if (normalized.includes('fail') || normalized.includes('cancel')) {
    return 'failed';
  }
  return 'processing';
};

const verifyHMACSignature = async (payload: string, signature: string, secret: string): Promise<boolean> => {
  if (!signature || !secret) return false;
  
  try {
    const hmac = createHmac('sha256', secret);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');
    
    const expectedBuffer = Buffer.from(expectedSignature);
    const receivedBuffer = Buffer.from(signature.replace('sha256=', ''));
    
    return expectedBuffer.length === receivedBuffer.length && 
           timingSafeEqual(expectedBuffer, receivedBuffer);
  } catch {
    return false;
  }
};

export async function POST(request: Request) {
  const signature = getHeaderSafe(request.headers.get('x-flouci-signature'));
  const webhookSecret = process.env.FLOUCI_WEBHOOK_SECRET || '';
  const idempotencyKey = getHeaderSafe(request.headers.get('x-idempotency-key'));

  // Validate HMAC signature
  if (webhookSecret) {
    const payloadText = await request.text();
    const isValid = await verifyHMACSignature(payloadText, signature, webhookSecret);
    
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    // Re-parse the body for further processing
    request = new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body: payloadText,
    });
  }

  let payload: WebhookPayload | null = null;
  try {
    payload = (await request.json()) as WebhookPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!payload) {
    return NextResponse.json({ error: 'Empty payload' }, { status: 400 });
  }

  // Check idempotency key
  if (idempotencyKey && supabaseUrl && serviceRoleKey) {
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data: existingEvent } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();

    if (existingEvent) {
      return NextResponse.json({ received: true, message: 'Event already processed' });
    }
  }

  const statusRaw =
    (payload.status as string) ||
    (payload.result as { status?: string })?.status ||
    (payload.payment_status as string) ||
    (payload.payment as { status?: string })?.status ||
    '';

  const amountRaw =
    (payload.amount as number) ||
    (payload.result as { amount?: number })?.amount ||
    (payload.payment as { amount?: number })?.amount ||
    0;

  const currency =
    (payload.currency as string) ||
    (payload.result as { currency?: string })?.currency ||
    (payload.payment as { currency?: string })?.currency ||
    'TND';

  const orderId =
    (payload.order_id as string) ||
    (payload.orderId as string) ||
    (payload.developer_tracking_id as string) ||
    (payload.result as { order_id?: string })?.order_id ||
    (payload.result as { developer_tracking_id?: string })?.developer_tracking_id ||
    (payload.payment as { order_id?: string })?.order_id;

  const paymentId =
    (payload.payment_id as string) ||
    (payload.result as { payment_id?: string })?.payment_id ||
    (payload.payment as { payment_id?: string; id?: string })?.payment_id ||
    (payload.payment as { payment_id?: string; id?: string })?.id;

  const metadata =
    (payload.metadata as Record<string, unknown>) ||
    (payload.result as { metadata?: Record<string, unknown> })?.metadata ||
    (payload.payment as { metadata?: Record<string, unknown> })?.metadata ||
    {};

  let status = normalizeStatus(statusRaw || 'processing');
  let amountValue = Number(amountRaw) || 0;
  let amountTnd = currency === 'TND' ? amountValue / 1000 : amountValue;
  let developerTrackingId = orderId;

  // Get Supabase configuration early for idempotency check
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (paymentId) {
    const appId = process.env.FLOUCI_PUBLIC_KEY;
    const appSecret = process.env.FLOUCI_SECRET_KEY;
    if (appId && appSecret) {
      const verifyResponse = await fetch(
        `https://developers.flouci.com/api/v2/verify_payment/${paymentId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${appId}:${appSecret}`,
          },
        }
      );

      const verifyText = await verifyResponse.text();
      let verifyData: unknown = null;
      try {
        verifyData = verifyText ? JSON.parse(verifyText) : null;
      } catch {
        verifyData = null;
      }

      if (
        verifyData &&
        typeof verifyData === 'object' &&
        (verifyData as { success?: boolean }).success === true
      ) {
        const result = (verifyData as { result?: Record<string, unknown> })
          .result;
        const verifyStatus = (result?.status as string | undefined) || '';
        const verifyAmount = Number(result?.amount) || amountValue;
        const verifyTrackingId = result?.developer_tracking_id as
          | string
          | undefined;

        status = normalizeStatus(verifyStatus || statusRaw || 'processing');
        amountValue = verifyAmount;
        amountTnd = currency === 'TND' ? amountValue / 1000 : amountValue;
        developerTrackingId = verifyTrackingId || developerTrackingId;
      }
    }
  }

  // Validate Supabase configuration
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'Missing Supabase configuration' },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // Record webhook event for idempotency
  if (idempotencyKey) {
    const { error: eventError } = await supabase.from('webhook_events').insert([
      {
        idempotency_key: idempotencyKey,
        event_type: 'payment_webhook',
        payload: payload,
      },
    ]);

    if (eventError) {
      console.error('Failed to record webhook event:', eventError);
    }
  }

  // Validate required fields
  if (!developerTrackingId) {
    return NextResponse.json(
      { error: 'Missing order ID' },
      { status: 400 }
    );
  }

  const description = `Flouci order ${developerTrackingId}`;
  
  // Check for existing transaction with better validation
  const { data: existingTransaction } = await supabase
    .from('transactions')
    .select('id, status')
    .eq('description', description)
    .maybeSingle();

  // Only create new transaction if it doesn't exist or status changed
  if (!existingTransaction) {
    const { error } = await supabase.from('transactions').insert([
      {
        type: 'sale',
        amount: amountTnd,
        status,
        description,
        metadata: {
          payment_id: paymentId,
          order_id: developerTrackingId,
          original_payload: payload,
        },
      },
    ]);

    if (error) {
      console.error('Failed to record transaction:', error);
      return NextResponse.json(
        { error: 'Failed to record transaction' },
        { status: 500 }
      );
    }
  } else if (existingTransaction.status !== status) {
    // Update status if changed
    const { error: updateError } = await supabase
      .from('transactions')
      .update({ 
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingTransaction.id);

    if (updateError) {
      console.error('Failed to update transaction status:', updateError);
    }
  }

  // Create tickets only for completed payments
  if (status === 'completed') {
    const eventId = metadata.event_id as string | undefined;
    const userId = metadata.user_id as string | undefined;
    const quantityValue = Number(metadata.quantity) || 0;
    const ticketTypeId =
      (metadata.ticket_type_id as string | undefined) || null;

    if (eventId && userId && quantityValue > 0) {
      const unitPrice = quantityValue ? amountTnd / quantityValue : amountTnd;
      const ticketsToInsert = Array.from({ length: quantityValue }).map(
        () => ({
          event_id: eventId,
          user_id: userId,
          price_paid: unitPrice,
          status: 'valid',
          ticket_type_id: ticketTypeId,
        })
      );

      const { error: ticketsError } = await supabase
        .from('tickets')
        .insert(ticketsToInsert);

      if (ticketsError) {
        console.error('Failed to create tickets:', ticketsError);
        return NextResponse.json(
          { error: 'Failed to create tickets' },
          { status: 500 }
        );
      }
    }
  }

  return NextResponse.json({ received: true });
}
