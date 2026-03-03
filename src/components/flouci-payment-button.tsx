'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type FlouciPaymentButtonProps = {
  amountTnd: number;
  currency?: string;
  orderId?: string;
  successUrl?: string;
  failUrl?: string;
  customer?: {
    email?: string;
    phone?: string;
  };
  metadata?: Record<string, string | number | boolean>;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export function FlouciPaymentButton({
  amountTnd,
  currency = 'TND',
  orderId,
  successUrl,
  failUrl,
  customer,
  metadata,
  disabled,
  className,
  children,
}: FlouciPaymentButtonProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (disabled || isLoading) return;
    if (!Number.isFinite(amountTnd) || amountTnd <= 0) {
      toast({
        variant: 'destructive',
        title: 'Montant invalide',
        description: 'Veuillez vérifier le montant avant de continuer.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/flouci/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(amountTnd * 1000),
          currency,
          orderId,
          successUrl,
          failUrl,
          customer,
          metadata,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const details =
          typeof data?.details === 'string'
            ? data.details
            : data?.details
              ? JSON.stringify(data.details)
              : '';
        const message = data?.error || 'Impossible de créer le paiement';
        throw new Error(details ? `${message} (${details})` : message);
      }

      const paymentUrl =
        data?.result?.link ||
        data?.result?.payment_url ||
        data?.payment_url ||
        data?.paymentUrl;

      if (!paymentUrl) {
        throw new Error('URL de paiement introuvable');
      }

      window.location.href = paymentUrl;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur de paiement',
        description: error?.message || 'Une erreur est survenue.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      className={className}
      size="lg"
      onClick={handleClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Traitement...
        </>
      ) : (
        children || <>Payer {amountTnd.toFixed(2)} TND</>
      )}
    </Button>
  );
}
