# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Flouci Payment Integration

### Environment Variables

Create a `.env.local` file:

```
FLOUCI_PUBLIC_KEY=your_public_key
FLOUCI_SECRET_KEY=your_secret_key
FLOUCI_WEBHOOK_SECRET=your_webhook_secret_optional
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_optional
```

### API Routes (App Router)

- `POST /api/flouci/create-payment`
- `POST /api/flouci/webhook`

### Client Usage

```tsx
import { FlouciPaymentButton } from '@/components/flouci-payment-button';

<FlouciPaymentButton
  amountTnd={49.9}
  customer={{ email: 'client@example.com', phone: '+21612345678' }}
  metadata={{ order_id: 'order-123' }}
  className="w-full bg-gradient-primary border-0"
/>
```

### Testing

- Use Flouci sandbox keys.
- Use a local tunnel (ngrok) for webhook testing.
- Confirm both success and failure redirects at `/payment/success` and `/payment/fail`.
