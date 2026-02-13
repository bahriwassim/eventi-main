'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, Ticket, CheckCircle, XCircle, Loader, Loader2, ScanLine } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { Html5Qrcode } from 'html5-qrcode';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

type ScanStatus = 'idle' | 'scanning' | 'valid' | 'invalid';

export default function GatePage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const supabase = createClient();

  const [status, setStatus] = useState<ScanStatus>('idle');
  const [scannedTicket, setScannedTicket] = useState<any | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  // Cleanup scanner on unmount
  useEffect(() => {
      return () => {
          if (scannerRef.current) {
              scannerRef.current.stop().catch(console.error);
          }
      };
  }, []);

  const startScanner = async () => {
    setStatus('scanning');
    setScannedTicket(null);

    // Give DOM time to render the 'reader' div
    setTimeout(async () => {
        try {
            if (scannerRef.current) {
                await scannerRef.current.stop().catch(() => {});
            }
            
            const html5QrCode = new Html5Qrcode("reader");
            scannerRef.current = html5QrCode;
            
            await html5QrCode.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                (decodedText) => {
                    verifyTicket(decodedText);
                },
                (errorMessage) => {
                    // ignore scan errors, they happen when no QR is in frame
                }
            );
        } catch (err) {
            console.error("Error starting scanner", err);
            setStatus('invalid');
        }
    }, 100);
  };

  const stopScanner = async () => {
      if (scannerRef.current) {
          try {
            await scannerRef.current.stop();
            scannerRef.current = null;
          } catch (e) {
            console.error("Error stopping scanner", e);
          }
      }
  };

  const verifyTicket = async (ticketId: string) => {
    await stopScanner();
    
    try {
        // Fetch the ticket
        const { data: ticket, error } = await supabase
            .from('tickets')
            .select('*, events(name), users(email)')
            .eq('id', ticketId)
            .single();
        
        if (error || !ticket) {
            console.error("Ticket not found", error);
            setStatus('invalid');
            return;
        }

        if (ticket.status !== 'valid') {
            console.warn("Ticket not valid (used or cancelled)", ticket.status);
            setStatus('invalid');
            return;
        }
            
        // Mark as used
        const { error: updateError } = await supabase
            .from('tickets')
            .update({ status: 'used', scanned_at: new Date().toISOString() })
            .eq('id', ticketId);

        if (updateError) throw updateError;

        setScannedTicket({
            ticketId: ticket.id,
            eventName: ticket.events?.name || 'Événement Inconnu',
            holderName: ticket.users?.email || 'Utilisateur Inconnu'
        });
        setStatus('valid');

    } catch (error) {
        console.error('Scan error:', error);
        setStatus('invalid');
    }
  };

  const resetScanner = () => {
    setStatus('idle');
    setScannedTicket(null);
  }

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const StatusDisplay = () => {
    switch (status) {
      case 'scanning':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center">
             <div id="reader" className="w-full h-64 bg-black rounded-lg overflow-hidden"></div>
             <p className="mt-4 text-sm text-muted-foreground animate-pulse">Recherche de QR Code...</p>
             <Button onClick={() => { stopScanner(); setStatus('idle'); }} variant="ghost" className="mt-2 text-xs">Annuler</Button>
          </div>
        );
      case 'valid':
        return (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 animate-check-bounce">
              <CheckCircle className="h-10 w-10 text-green-400" />
            </div>
            <p className="mt-4 text-2xl font-bold text-green-400 font-headline">Billet Valide</p>
            {scannedTicket && (
              <div className="mt-4 text-left p-4 bg-green-500/5 rounded-xl border border-green-500/10 space-y-1.5">
                <p className="text-sm"><strong className="text-green-300">Événement :</strong> <span className="text-muted-foreground">{scannedTicket.eventName}</span></p>
                <p className="text-sm"><strong className="text-green-300">ID du Billet :</strong> <span className="text-muted-foreground">{scannedTicket.ticketId}</span></p>
                <p className="text-sm"><strong className="text-green-300">Détenteur :</strong> <span className="text-muted-foreground">{scannedTicket.holderName}</span></p>
              </div>
            )}
            <Button onClick={resetScanner} className="mt-6 w-full bg-gradient-primary hover:opacity-90 transition-opacity border-0">Scanner le suivant</Button>
          </div>
        );
      case 'invalid':
        return (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 animate-check-bounce">
              <XCircle className="h-10 w-10 text-red-400" />
            </div>
            <p className="mt-4 text-2xl font-bold text-red-400 font-headline">Billet Invalide</p>
            <p className="text-sm text-muted-foreground mt-2">Ce code QR n&apos;est pas reconnu ou a déjà été utilisé.</p>
            <Button onClick={resetScanner} className="mt-6 w-full border-white/10 bg-white/5 hover:bg-white/10" variant="outline">Réessayer</Button>
          </div>
        );
      case 'idle':
      default:
        return (
          <div className="text-center">
            <div className="relative inline-block">
              <QrCode className="h-20 w-20 text-muted-foreground" />
              <ScanLine className="absolute inset-0 h-20 w-20 text-primary/40 animate-bounce-subtle" />
            </div>
            <p className="mt-6 text-sm text-muted-foreground">Prêt à scanner pour l&apos;entrée à l&apos;événement</p>
            <Button onClick={startScanner} className="mt-6 w-full bg-gradient-primary hover:opacity-90 transition-opacity border-0 shadow-glow-sm" size="lg">
              Commencer le Scan
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-purple-500/8 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md animate-scale-in">
        <div className="rounded-2xl glass border-white/5 p-6">
          <h1 className="text-center text-xl font-bold font-headline text-foreground flex items-center justify-center gap-2 mb-6">
            <Ticket className="h-5 w-5 text-primary" />
            Vérification à l&apos;entrée
          </h1>
          <div
            className={cn(
              'aspect-square w-full rounded-xl flex items-center justify-center p-8 transition-all duration-500 border',
              status === 'valid' && 'bg-green-500/5 border-green-500/20',
              status === 'invalid' && 'bg-red-500/5 border-red-500/20',
              status === 'scanning' && 'bg-primary/5 border-primary/20',
              status === 'idle' && 'bg-white/5 border-white/5'
            )}
          >
            <StatusDisplay />
          </div>
        </div>
      </div>
    </div>
  );
}
