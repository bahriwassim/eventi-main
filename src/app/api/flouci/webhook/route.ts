import { timingSafeEqual } from 'crypto';
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

export async function POST(request: Request) {
  const signature = getHeaderSafe(request.headers.get('x-flouci-signature'));
  const webhookSecret = process.env.FLOUCI_WEBHOOK_SECRET || '';

  if (webhookSecret) {
    const expected = Buffer.from(webhookSecret);
    const received = Buffer.from(signature);
    if (
      expected.length !== received.length ||
      !timingSafeEqual(expected, received)
    ) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
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

  const metadata =
    (payload.metadata as Record<string, unknown>) ||
    (payload.result as { metadata?: Record<string, unknown> })?.metadata ||
    (payload.payment as { metadata?: Record<string, unknown> })?.metadata ||
    {};

  const status = normalizeStatus(statusRaw || 'processing');
  const amountValue = Number(amountRaw) || 0;
  const amountTnd = currency === 'TND' ? amountValue / 1000 : amountValue;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (supabaseUrl && serviceRoleKey) {
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const description = orderId ? `Flouci order ${orderId}` : 'Flouci payment';
    const { data: existingTransaction } = await supabase
      .from('transactions')
      .select('id')
      .eq('description', description)
      .maybeSingle();

    if (!existingTransaction) {
      const { error } = await supabase.from('transactions').insert([
        {
          type: 'sale',
          amount: amountTnd,
          status,
          description,
        },
      ]);

      if (error) {
        return NextResponse.json(
          { error: 'Failed to record transaction' },
          { status: 500 }
        );
      }
    }

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
          return NextResponse.json(
            { error: 'Failed to create tickets' },
            { status: 500 }
          );
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
