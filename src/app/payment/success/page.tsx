import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-2xl glass border-white/10 p-8 text-center space-y-4">
        <CheckCircle className="h-14 w-14 text-emerald-400 mx-auto" />
        <h1 className="text-2xl font-bold font-headline text-foreground">
          Paiement confirmé
        </h1>
        <p className="text-sm text-muted-foreground">
          Merci pour votre achat. Vous recevrez votre confirmation par email.
        </p>
        <div className="pt-2">
          <Button asChild className="bg-gradient-primary border-0">
            <Link href="/profile">Voir mes billets</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
