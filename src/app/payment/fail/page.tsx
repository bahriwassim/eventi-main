import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentFailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-2xl glass border-white/10 p-8 text-center space-y-4">
        <XCircle className="h-14 w-14 text-red-400 mx-auto" />
        <h1 className="text-2xl font-bold font-headline text-foreground">
          Paiement échoué
        </h1>
        <p className="text-sm text-muted-foreground">
          Le paiement n&apos;a pas abouti. Vous pouvez réessayer ou contacter le
          support.
        </p>
        <div className="pt-2">
          <Button asChild variant="outline">
            <Link href="/">Retour à l&apos;accueil</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
