'use client';

import { notFound, useRouter } from 'next/navigation';
import { useState } from 'react';
import { events } from '@/lib/placeholder-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Ticket, CreditCard, Calendar, MapPin, Plus, Minus, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/use-user';

type CheckoutPageProps = {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default function CheckoutPage({ params, searchParams }: CheckoutPageProps) {
  const event = events.find((e) => e.id === params.id);
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!event) {
    notFound();
  }

  const [quantity, setQuantity] = useState(searchParams?.quantity ? parseInt(searchParams.quantity as string) : 1);
  const selectedType = searchParams?.type as string || 'Billet Standard';
  const urlPrice = searchParams?.price ? parseFloat(searchParams.price as string) : null;
  const ticketPrice = urlPrice ?? event.price;

  const subtotal = ticketPrice * quantity;
  const fees = subtotal * 0.07;
  const total = subtotal + fees;

  const typeLabel = (type: string) => {
    if (type === 'Billet Standard') return 'Billet';
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => Math.max(1, prev + amount));
  }

  const handlePayment = async () => {
    if (!user) {
      toast({ variant: "destructive", title: "Erreur", description: "Vous devez être connecté pour acheter un billet." });
      router.push('/login');
      return;
    }

    setIsProcessing(true);

    try {
      // Create tickets in DB
      const ticketsToInsert = Array.from({ length: quantity }).map(() => ({
        event_id: event.id,
        user_id: user.id,
        ticket_type: selectedType,
        price: ticketPrice,
        status: 'valid'
      }));

      const { error } = await supabase.from('tickets').insert(ticketsToInsert);

      if (error) throw error;

      toast({ title: "Paiement réussi", description: "Vos billets ont été générés." });
      router.push(`/confirmation/${event.id}?type=${selectedType}&price=${ticketPrice}&quantity=${quantity}`);
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({ variant: "destructive", title: "Erreur de paiement", description: "Une erreur est survenue lors du traitement." });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-purple-500/8 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href={`/events/${event.id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Retour à l&apos;événement
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Payment form */}
          <div className="md:order-1 animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-6 font-headline text-foreground flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Paiement Sécurisé
            </h2>
            <div className="rounded-2xl glass border-white/5 p-6 space-y-5">
              <p className="text-sm text-muted-foreground">
                Finalisez votre achat en fournissant vos informations de paiement.
              </p>
              <div className="space-y-4">
                {Array.from({ length: quantity }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Label htmlFor={`name-${index}`} className="text-sm text-muted-foreground">
                      {quantity > 1 ? `Nom complet (Billet #${index + 1})` : 'Nom complet'}
                    </Label>
                    <Input 
                      id={`name-${index}`} 
                      placeholder="Flen ben Foulen " 
                      className="bg-white/5 border-white/10 focus:border-primary/50 transition-all" 
                      required
                    />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-muted-foreground">Adresse e-mail</Label>
                <Input id="email" type="email" placeholder="amina@example.com" className="bg-white/5 border-white/10 focus:border-primary/50 transition-all" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm text-muted-foreground">Numéro de téléphone</Label>
                <Input id="phone" type="tel" placeholder="+216 XX XXX XXX" className="bg-white/5 border-white/10 focus:border-primary/50 transition-all" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Quantité</Label>
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="icon" className="h-10 w-10 border-white/10 bg-white/5 hover:bg-white/10" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-xl font-bold w-10 text-center text-foreground font-headline">{quantity}</span>
                  <Button variant="outline" size="icon" className="h-10 w-10 border-white/10 bg-white/5 hover:bg-white/10" onClick={() => handleQuantityChange(1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Separator className="bg-white/10" />
              <div className="space-y-2">
                <Label htmlFor="card" className="text-sm text-muted-foreground">Détails de la carte</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="card" placeholder="Numéro de carte" className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="expiry" className="text-sm text-muted-foreground">Expiration</Label>
                  <Input id="expiry" placeholder="MM/AA" className="bg-white/5 border-white/10 focus:border-primary/50 transition-all" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvc" className="text-sm text-muted-foreground">CVC</Label>
                  <Input id="cvc" placeholder="CVC" className="bg-white/5 border-white/10 focus:border-primary/50 transition-all" />
                </div>
              </div>
              <Button 
                className="w-full bg-gradient-primary hover:opacity-90 transition-opacity border-0 shadow-glow-sm mt-2" 
                size="lg" 
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <Ticket className="mr-2 h-5 w-5" />
                    Payer {total.toFixed(2)} TND
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Order summary */}
          <div className="md:order-2 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <h2 className="text-2xl font-bold mb-6 font-headline text-foreground">Résumé de la commande</h2>
            <div className="rounded-2xl glass border-white/5 p-6 space-y-4">
              <div>
                <h3 className="text-lg font-bold font-headline text-foreground">{event.name}</h3>
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4 text-purple-400" />
                    {new Date(event.date).toLocaleDateString('fr-FR', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4 text-fuchsia-400" />
                    {event.location}
                  </div>
                </div>
              </div>
              <Separator className="bg-white/10" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{quantity} x {typeLabel(selectedType)}</span>
                  <span className="text-foreground">{subtotal.toFixed(2)} TND</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frais de traitement</span>
                  <span className="text-foreground">{fees.toFixed(2)} TND</span>
                </div>
              </div>
              <Separator className="bg-white/10" />
              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-2xl font-bold text-gradient font-headline">{total.toFixed(2)} TND</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
