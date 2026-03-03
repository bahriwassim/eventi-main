'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Ticket, CreditCard, Calendar, MapPin, Plus, Minus, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/use-user';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { PrivacyPolicyContent } from '@/components/privacy-policy-content';
import { slugify, getIdFromSlug } from '@/lib/slug';

type CheckoutPageProps = {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default function CheckoutPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const params = useParams<{ id: string }>();
  // Ensure supabase client is stable across renders to prevent unnecessary re-runs
  const [supabase] = useState(() => createClient());
  const { toast } = useToast();
  const { user } = useUser();
  
  const [event, setEvent] = useState<any>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [acceptPolicy, setAcceptPolicy] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);

  // Redirect if user is not logged in and trying to access checkout
  useEffect(() => {
    // This effect is primarily for logging, not redirection.
    // The UI will conditionally render a login/signup form if the user is not present.
    if (!user && !loadingEvent) {
      console.log('User not logged in, checkout page will show login/signup form.');
    }
  }, [user, loadingEvent]);

  // Fetch Event Data
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchEvent = async () => {
      const id = getIdFromSlug(params.id);
      
      try {
        // Try DB first
        const { data: dbEvent, error } = await supabase
          .from('events')
          .select(`
              *,
              ticket_types (*)
          `)
          .eq('id', id)
          .single();
          
        if (signal.aborted) return;

        if (dbEvent) {
          setEvent(dbEvent);
        } else {
          // Not found anywhere
          setEvent(null);
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error("Fetch event error:", error);
        }
      } finally {
        if (!signal.aborted) {
          setLoadingEvent(false);
        }
      }
    };
    
    fetchEvent().catch(err => {
      // Safety net for unhandled rejections
      if (err.name !== 'AbortError') {
         console.error("Unhandled error in fetchEvent:", err);
      }
    });

    return () => {
      controller.abort();
    };
  }, [params.id, supabase]);

  const [quantity, setQuantity] = useState(searchParams?.quantity ? parseInt(searchParams.quantity as string) : 1);
  const selectedType = searchParams?.type as string || 'Billet Standard';
  
  // Form State
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [attendeeNames, setAttendeeNames] = useState<string[]>(Array(quantity).fill(''));
  const [password, setPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(false);

  // Update attendee names array when quantity changes
  useEffect(() => {
    setAttendeeNames(prev => {
      const newNames = [...prev];
      if (quantity > prev.length) {
        return [...newNames, ...Array(quantity - prev.length).fill('')];
      } else {
        return newNames.slice(0, quantity);
      }
    });
  }, [quantity]);

  // Pre-fill user data
  useEffect(() => {
    if (user) {
      if (!email) setEmail(user.email || '');
      if (!phone) setPhone(user.phone || (user.user_metadata && user.user_metadata.phone_number) || '');
      setAttendeeNames(prev => {
        const newNames = [...prev];
        if (newNames.length > 0 && !newNames[0]) {
          newNames[0] = (user.user_metadata && user.user_metadata.full_name) || '';
        }
        return newNames;
      });
    }
  }, [user, email, phone]);

  if (loadingEvent) {
      return (
          <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      );
  }

  if (!event) {
    notFound();
    return null;
  }

  // Calculate ticket price securely
  let ticketPrice = event.price;
  let ticketTypeId: string | null = null;

  if (event.ticket_types && event.ticket_types.length > 0) {
      // Find matching ticket type
      // Check both exact name match or if selectedType is a key/ID
      const typeObj = event.ticket_types.find((t: any) => t.name === selectedType || t.id === selectedType);
      
      if (typeObj) {
          ticketPrice = typeObj.price;
          ticketTypeId = typeObj.id;
      }
  } else {
      // Legacy/Placeholder logic: trust URL or event.price
       const urlPrice = searchParams?.price ? parseFloat(searchParams.price as string) : null;
       if (urlPrice && !isNaN(urlPrice)) ticketPrice = urlPrice;
  }
  
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
    if (!acceptPolicy) {
      toast({ variant: "destructive", title: "Validation requise", description: "Veuillez lire et accepter la Politique de confidentialité." });
      return;
    }

    // Basic Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9\s-]{8,}$/;

    if (!user) {
      if (!email || !emailRegex.test(email)) {
        toast({ variant: "destructive", title: "Email invalide", description: "Veuillez entrer une adresse email valide." });
        return;
      }
      if (!password || password.length < 6) {
        toast({ variant: "destructive", title: "Mot de passe court", description: "Le mot de passe doit contenir au moins 6 caractères." });
        return;
      }
    }

    if (phone && !phoneRegex.test(phone)) {
      toast({ variant: "destructive", title: "Téléphone invalide", description: "Veuillez entrer un numéro de téléphone valide." });
      return;
    }

    // Validate attendee names ONLY when l'utilisateur est connecté (champs visibles)
    if (user && attendeeNames.some(name => !name.trim())) {
      toast({ variant: "destructive", title: "Noms manquants", description: "Veuillez renseigner le nom de chaque participant." });
      return;
    }

    setIsProcessing(true);

    try {
      // Handle Authentication if not logged in
      let userId = user?.id;

      if (!userId) {
        if (!email || !password) {
          toast({ variant: "destructive", title: "Champs requis", description: "Veuillez remplir l'email et le mot de passe." });
          setIsProcessing(false);
          return;
        }

        if (isLoginMode) {
          // Login
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          userId = data.user.id;
          toast({ title: "Connexion réussie", description: "Vous êtes connecté. Renseignez les noms des participants puis relancez le paiement." });
          setIsProcessing(false);
          return; // laisser l'interface se rafraîchir pour afficher les champs participants
        } else {
          // Signup
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: attendeeNames[0] || email.split('@')[0],
                phone_number: phone,
              }
            }
          });
          if (error) throw error;
          userId = data.user?.id;
          
          if (!userId) {
            toast({ title: "Inscription réussie", description: "Veuillez vérifier votre email pour confirmer votre compte." });
            setIsProcessing(false);
            return;
          }
          toast({ title: "Compte créé", description: "Vous êtes connecté. Renseignez les noms des participants puis relancez le paiement." });
          setIsProcessing(false);
          return; // idem: afficher la zone participants après création de compte
        }
      }

      if (attendeeNames.some(name => !name.trim())) {
        toast({ variant: "destructive", title: "Noms manquants", description: "Veuillez renseigner le nom de chaque participant." });
        setIsProcessing(false);
        return;
      }

      const shortEventId = String(event.id).replace(/-/g, '').slice(0, 8);
      const shortUserId = String(userId).replace(/-/g, '').slice(0, 8);
      const orderId = `e${shortEventId}-u${shortUserId}-q${quantity}`;
      const response = await fetch('/api/flouci/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(total * 1000),
          currency: 'TND',
          orderId,
          metadata: {
            event_id: event.id,
            ticket_type_id: ticketTypeId || '',
            quantity,
            user_id: userId || '',
            ticket_type: selectedType,
          },
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
      console.error('Payment error:', error);
      toast({ variant: "destructive", title: "Erreur", description: error.message || "Une erreur est survenue." });
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
        <Link href={`/events/${slugify(event.name, event.id)}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group">
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
              
              {!user && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
                  <div className="flex gap-4 border-b border-white/10 pb-2">
                    <button 
                      className={`text-sm font-medium pb-2 border-b-2 transition-colors ${!isLoginMode ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                      onClick={() => setIsLoginMode(false)}
                    >
                      Nouveau Compte
                    </button>
                    <button 
                      className={`text-sm font-medium pb-2 border-b-2 transition-colors ${isLoginMode ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                      onClick={() => setIsLoginMode(true)}
                    >
                      Se Connecter
                    </button>
                  </div>
                  
                  {!isLoginMode ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name" className="text-sm text-muted-foreground">Nom complet</Label>
                        <Input 
                          id="signup-name" 
                          placeholder="Votre nom" 
                          className="bg-white/5 border-white/10 focus:border-primary/50 transition-all" 
                          value={attendeeNames[0] || ''}
                          onChange={(e) => {
                            const newNames = [...attendeeNames];
                            newNames[0] = e.target.value;
                            setAttendeeNames(newNames);
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-sm text-muted-foreground">Email</Label>
                        <Input 
                          id="signup-email" 
                          type="email" 
                          placeholder="email@example.com" 
                          className="bg-white/5 border-white/10 focus:border-primary/50 transition-all" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-phone" className="text-sm text-muted-foreground">Téléphone</Label>
                        <Input 
                          id="signup-phone" 
                          type="tel" 
                          placeholder="+216 XX XXX XXX" 
                          className="bg-white/5 border-white/10 focus:border-primary/50 transition-all" 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-sm text-muted-foreground">Mot de passe (pour créer votre compte)</Label>
                        <Input 
                          id="signup-password" 
                          type="password" 
                          placeholder="••••••••" 
                          className="bg-white/5 border-white/10 focus:border-primary/50 transition-all" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email" className="text-sm text-muted-foreground">Email</Label>
                        <Input 
                          id="login-email" 
                          type="email" 
                          placeholder="email@example.com" 
                          className="bg-white/5 border-white/10 focus:border-primary/50 transition-all" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password" className="text-sm text-muted-foreground">Mot de passe</Label>
                        <Input 
                          id="login-password" 
                          type="password" 
                          placeholder="••••••••" 
                          className="bg-white/5 border-white/10 focus:border-primary/50 transition-all" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {user && (
                <div className="space-y-4">
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center gap-3 text-sm text-primary mb-2">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span>Connecté en tant que <strong>{user.email}</strong></span>
                  </div>
                    {Array.from({ length: quantity }).map((_, index) => (
                      <div key={index} className="space-y-2">
                        <Label htmlFor={`name-${index}`} className="text-sm text-muted-foreground">
                          {quantity > 1 ? `Nom complet (Billet #${index + 1})` : 'Nom complet'}
                        </Label>
                        <Input 
                          id={`name-${index}`} 
                          placeholder="Nom et Prénom" 
                          className="bg-white/5 border-white/10 focus:border-primary/50 transition-all" 
                          required
                          value={attendeeNames[index] || ''}
                          onChange={(e) => {
                            const newNames = [...attendeeNames];
                            newNames[index] = e.target.value;
                            setAttendeeNames(newNames);
                          }}
                        />
                      </div>
                    ))}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm text-muted-foreground">Adresse e-mail</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email}
                      readOnly
                      className="bg-white/5 border-white/10 opacity-70 cursor-not-allowed" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm text-muted-foreground">Numéro de téléphone</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="+216 XX XXX XXX" 
                      className="bg-white/5 border-white/10 focus:border-primary/50 transition-all" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              )}
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
              <div className="flex items-start gap-3">
                <Checkbox id="privacy-accept" checked={acceptPolicy} onCheckedChange={(v) => setAcceptPolicy(!!v)} />
                <Label htmlFor="privacy-accept" className="text-sm text-muted-foreground">
                  J&apos;ai lu et j&apos;accepte la{" "}
                  <button type="button" className="text-primary underline hover:text-fuchsia-400" onClick={() => setPolicyOpen(true)}>
                    Politique de confidentialité
                  </button>
                  .
                </Label>
              </div>
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
                disabled={isProcessing || !acceptPolicy}
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
      <Dialog open={policyOpen} onOpenChange={setPolicyOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto glass border-white/10">
          <DialogHeader>
            <DialogTitle className="text-foreground">Politique de Confidentialité</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <PrivacyPolicyContent />
          </div>
          <DialogFooter>
            <Button onClick={() => setPolicyOpen(false)} className="ml-auto bg-gradient-primary">Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
