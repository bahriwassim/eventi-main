'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText } from "lucide-react";
import jsPDF from "jspdf";
import { events, users } from "@/lib/placeholder-data";

export default function SuperAdminReportsPage() {

  const generateSimplePDFReport = () => {
    const doc = new jsPDF();

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(20);
    doc.text("Rapport Financier - Evanti", 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('Helvetica', 'normal');
    doc.text(`Date de génération: ${new Date().toLocaleDateString('fr-FR')}`, 20, 35);

    doc.line(20, 40, 190, 40);

    doc.setFontSize(16);
    doc.setFont('Helvetica', 'bold');
    doc.text("Résumé des Ventes", 20, 50);

    const allSales = users.flatMap(user => user.purchasedTickets);
    let y = 60;
    let totalRevenue = 0;

    events.forEach(event => {
      const salesForEvent = allSales.filter(sale => sale.eventId === event.id);
      const ticketCount = salesForEvent.length;
      if (ticketCount > 0) {
        const revenue = ticketCount * event.price;
        totalRevenue += revenue;

        doc.setFontSize(12);
        doc.setFont('Helvetica', 'bold');
        doc.text(event.name, 20, y);
        y += 7;

        doc.setFontSize(10);
        doc.setFont('Helvetica', 'normal');
        doc.text(`- Billets Vendus: ${ticketCount}`, 25, y);
        doc.text(`- Revenu: ${revenue.toFixed(2)} TND`, 80, y);
        y += 10;
      }
    });

    doc.line(20, y, 190, y);
    y += 10;

    doc.setFontSize(14);
    doc.setFont('Helvetica', 'bold');
    doc.text(`REVENU TOTAL: ${totalRevenue.toFixed(2)} TND`, 20, y);

    doc.save('rapport-financier.pdf');
  };

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-3xl font-bold font-headline mb-2 text-foreground">Rapports Financiers</h1>
      <p className="text-muted-foreground mb-8">
        Générez et téléchargez des rapports financiers détaillés.
      </p>

      <Card className="border-white/5 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Générateur de Rapports</CardTitle>
          <CardDescription>
            Configurez les options et générez un rapport au format PDF.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="report-type" className="text-muted-foreground">Type de Rapport</Label>
              <Select defaultValue="sales-summary">
                <SelectTrigger id="report-type" className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent className="glass-strong border-white/10">
                  <SelectItem value="sales-summary">Résumé des Ventes</SelectItem>
                  <SelectItem value="commission-report" disabled>Rapport des Commissions</SelectItem>
                  <SelectItem value="user-report" disabled>Rapport des Utilisateurs</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="start-date" className="text-muted-foreground">Date de Début</Label>
              <Input id="start-date" type="date" defaultValue="2026-01-01" className="bg-white/5 border-white/10 focus:border-primary/50 transition-all" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date" className="text-muted-foreground">Date de Fin</Label>
              <Input id="end-date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="bg-white/5 border-white/10 focus:border-primary/50 transition-all" />
            </div>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-xl p-6 text-center">
            <FileText className="h-12 w-12 text-primary/40 mx-auto mb-4" />
            <h3 className="font-semibold text-foreground">Votre rapport est prêt à être généré.</h3>
            <p className="text-sm text-muted-foreground">Les paramètres sélectionnés seront appliqués au document PDF.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button size="lg" onClick={generateSimplePDFReport} className="bg-gradient-primary hover:opacity-90 transition-opacity border-0 shadow-glow-sm">
            <Download className="mr-2 h-5 w-5" />
            Générer et Télécharger le PDF
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
