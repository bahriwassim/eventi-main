'use client';

import { notFound, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CheckCircle, Download, Mail, Loader2, PartyPopper } from 'lucide-react';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { createClient } from '@/lib/supabase/client';

import { events, users } from '@/lib/placeholder-data';
import type { Event, Ticket, User as DemoUser } from '@/lib/placeholder-data';
import { Button } from '@/components/ui/button';
import { QrCode } from '@/components/qr-code';
import { useUser } from '@/hooks/use-user';


type ConfirmationPageProps = {
  params: { id: string };
};

export default function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { user, loading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const quantity = searchParams.get('quantity') ? parseInt(searchParams.get('quantity') as string, 10) : 1;
  const [ticket, setTicket] = useState<any>(null);
  const [loadingTicket, setLoadingTicket] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    
    const fetchTicket = async () => {
        if (!user) return;
        
        // Try to find in placeholder data first (for demo users)
        const demoUser = users.find(u => u.email === user.email);
        const placeholderTicket = demoUser?.purchasedTickets.find((t) => t.eventId === params.id);
        
        if (placeholderTicket) {
            setTicket(placeholderTicket);
            setLoadingTicket(false);
            return;
        }

        // Fetch from Supabase
        const { data, error } = await supabase
            .from('tickets')
            .select('*')
            .eq('user_id', user.id)
            .eq('event_id', params.id)
            .order('purchase_date', { ascending: false })
            .limit(1)
            .maybeSingle();
            
        if (data) {
            // Map DB ticket to UI ticket format
            setTicket({
                ticketId: data.id,
                eventId: data.event_id,
                eventName: events.find(e => e.id === params.id)?.name || 'Événement',
                purchaseDate: data.purchase_date,
                qrCodeValue: data.qr_code_value || `EVENTI-${data.event_id}-${data.id}-${user.id}`
            });
        } else {
           // Check localStorage for simulated tickets
           const localTickets = JSON.parse(localStorage.getItem('eventi_local_tickets') || '[]');
           // Check user metadata for simulated tickets
           const metaTickets = user.user_metadata?.tickets || [];
           
           const allSimulatedTickets = [...localTickets, ...metaTickets];
           
           // Find the most recent ticket for this event and user
           const localTicket = allSimulatedTickets
                .filter((t: any) => t.user_id === user.id && t.event_id === params.id)
                .sort((a: any, b: any) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime())[0];
           
           if (localTicket) {
                setTicket({
                    ticketId: localTicket.id,
                    eventId: localTicket.event_id,
                    eventName: events.find(e => e.id === params.id)?.name || 'Événement',
                    purchaseDate: localTicket.purchase_date,
                    qrCodeValue: localTicket.qr_code_value
                });
           } else if (['1', '2', '3', '4', '5', '7', '9', '10', '11', '12', '13', '14'].includes(params.id)) {
                // Fallback for placeholder events if DB insert was simulated AND not found in local storage (edge case)
                setTicket({
                        ticketId: `SIM-${Math.floor(Math.random() * 10000)}`,
                        eventId: params.id,
                        eventName: events.find(e => e.id === params.id)?.name || 'Événement',
                        purchaseDate: new Date().toISOString(),
                        qrCodeValue: `EVENTI-${params.id}-SIM-${user.id}`
                });
           }
        }
        
        setLoadingTicket(false);
    };

    if (user) {
        fetchTicket();
    }
  }, [user, loading, router, params.id, supabase]);

  const event = events.find((e) => e.id === params.id);
  
  // Use real user data if available, otherwise fall back to demo structure for PDF generation types
  const displayUser = user ? {
      id: user.id,
      name: user.displayName || user.email?.split('@')[0] || 'Client',
      email: user.email || '',
      photoURL: user.photoURL || '',
      purchasedTickets: []
  } : null;

  const generatePDF = async (event: Event, ticket: any, user: any, quantity: number) => {
    const doc = new jsPDF();

    doc.addFont('Helvetica', 'Helvetica', 'normal');
    doc.setFont('Helvetica', 'normal');

    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42);
    doc.text("Billet d'événement", 105, 25, { align: 'center' });

    doc.setFontSize(18);
    doc.setFont('Helvetica', 'bold');
    doc.text(event.name, 20, 60);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text(`Date : ${new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 20, 70);
    doc.text(`Heure : ${event.time}`, 20, 78);
    doc.text(`Lieu : ${event.location}`, 20, 86);
    doc.text(`Catégorie : ${event.category}`, 20, 94);

    doc.setLineWidth(0.5);
    doc.line(20, 105, 190, 105);

    doc.text('Billet pour :', 20, 115);
    doc.setTextColor(15, 23, 42);
    doc.setFont('Helvetica', 'bold');
    doc.text(user.name, 20, 122);
    doc.setFont('Helvetica', 'normal');
    doc.text(user.email, 20, 129);

    doc.setTextColor(100, 116, 139);
    doc.text('ID du Billet :', 20, 140);
    doc.setTextColor(15, 23, 42);
    doc.text(ticket.ticketId, 20, 147);

    doc.setTextColor(100, 116, 139);
    doc.text("Date d'achat :", 20, 157);
    doc.setTextColor(15, 23, 42);
    doc.text(new Date(ticket.purchaseDate).toLocaleDateString('fr-FR'), 20, 164);

    doc.setTextColor(100, 116, 139);
    doc.text('Prix Unitaire :', 20, 174);
    doc.setTextColor(15, 23, 42);
    doc.setFont('Helvetica', 'bold');
    doc.text(`${event.price.toFixed(2)} TND`, 20, 181);

    doc.setTextColor(100, 116, 139);
    doc.text('Quantité :', 100, 174);
    doc.setTextColor(15, 23, 42);
    doc.setFont('Helvetica', 'bold');
    doc.text(`${quantity}`, 100, 181);

    doc.setFont('Helvetica', 'normal');

    // Generate QR Code
    try {
      const qrData = JSON.stringify({
        ticketId: ticket.ticketId,
        eventId: event.id,
        holderEmail: user.email,
        valid: true
      });
      const qrDataUrl = await QRCode.toDataURL(qrData);
      
      // Use PNG format for better compatibility and avoid atob issues with SVG in jsPDF sometimes
      // Just passing base64 data to addImage.
      doc.addImage(qrDataUrl, 'PNG', 140, 115, 50, 50);
    } catch (err) {
      console.error('QR Generation Error:', err);
      // Fallback if QR fails
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.rect(140, 115, 50, 50, 'FD');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('QR indisponible', 165, 140, { align: 'center' });
    }

    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text("Présentez ce billet à l'entrée. Ce billet est personnel et non transférable. Non remboursable.", 105, 200, { align: 'center' });

    doc.save(`billet-${event.name.replace(/\s/g, '_')}-${ticket.ticketId}.pdf`);
  };

  if (loading || !user || loadingTicket) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!event || !ticket || !displayUser) {
    return notFound();
  }

  return (
    <div className="relative">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-green-500/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-purple-500/6 rounded-full blur-[80px]" />
      </div>

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="rounded-2xl glass border-white/5 p-8 text-center animate-scale-in">
          {/* Success header */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 mb-4 animate-check-bounce">
              <CheckCircle className="h-10 w-10 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold font-headline text-foreground flex items-center justify-center gap-2">
              Achat Confirmé ! <PartyPopper className="h-7 w-7 text-yellow-400" />
            </h1>
            <p className="text-muted-foreground mt-2">
              Merci, {displayUser.name}. {quantity > 1 ? `Vos ${quantity} billets pour` : 'Votre billet pour'} {event.name} {quantity > 1 ? 'sont prêts' : 'est prêt'}.
            </p>
          </div>

          {/* Ticket details */}
          <div className="bg-white/5 border border-white/5 p-6 rounded-xl flex flex-col md:flex-row items-center gap-6 text-left mb-6">
            <div className="w-32 h-32 md:w-36 md:h-36 flex-shrink-0 bg-white p-2 rounded-xl shadow-glow-sm animate-glow-pulse">
              <QrCode />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-lg text-foreground font-headline">{event.name}</h3>
              <p className="text-sm text-muted-foreground">{new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} à {event.time}</p>
              <p className="text-sm text-muted-foreground">{event.location}</p>
              <p className="text-xs text-primary mt-2 font-medium">ID du billet: {ticket.ticketId} (x{quantity})</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Button onClick={() => generatePDF(event, ticket, displayUser, quantity)} className="bg-gradient-primary hover:opacity-90 transition-opacity border-0 shadow-glow-sm">
              <Download className="mr-2 h-4 w-4" />
              Télécharger le billet (PDF)
            </Button>
            <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10">
              <Mail className="mr-2 h-4 w-4" />
              Billet par e-mail
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Vous recevrez également un e-mail de confirmation à {displayUser.email}. Présentez ce code QR à l&apos;entrée.
          </p>
        </div>
      </div>
    </div>
  );
}
