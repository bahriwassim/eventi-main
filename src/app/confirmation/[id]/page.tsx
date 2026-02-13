'use client';

import { notFound, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { CheckCircle, Download, Mail, Loader2, PartyPopper } from 'lucide-react';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

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

  const quantity = searchParams.get('quantity') ? parseInt(searchParams.get('quantity') as string, 10) : 1;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const event = events.find((e) => e.id === params.id);
  const demoUser = user ? users.find(u => u.email === user.email) : null;
  const ticket = demoUser?.purchasedTickets.find((t) => t.eventId === params.id);

  const generatePDF = async (event: Event, ticket: Ticket, user: DemoUser, quantity: number) => {
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
      doc.addImage(qrDataUrl, 'PNG', 140, 115, 50, 50);
    } catch (err) {
      console.error(err);
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.rect(140, 115, 50, 50, 'FD');
      doc.text('Scannez-moi', 165, 140, { align: 'center' });
    }

    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text("Présentez ce billet à l'entrée. Ce billet est personnel et non transférable. Non remboursable.", 105, 200, { align: 'center' });

    doc.save(`billet-${event.name.replace(/\s/g, '_')}-${ticket.ticketId}.pdf`);
  };

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!event || !ticket || !demoUser) {
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
              Merci, {demoUser.name}. {quantity > 1 ? `Vos ${quantity} billets pour` : 'Votre billet pour'} {event.name} {quantity > 1 ? 'sont prêts' : 'est prêt'}.
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
            <Button onClick={() => generatePDF(event, ticket, demoUser, quantity)} className="bg-gradient-primary hover:opacity-90 transition-opacity border-0 shadow-glow-sm">
              <Download className="mr-2 h-4 w-4" />
              Télécharger le billet (PDF)
            </Button>
            <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10">
              <Mail className="mr-2 h-4 w-4" />
              Billet par e-mail
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Vous recevrez également un e-mail de confirmation à {demoUser.email}. Présentez ce code QR à l&apos;entrée.
          </p>
        </div>
      </div>
    </div>
  );
}
