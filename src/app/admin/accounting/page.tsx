"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, Wallet, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Mock Data for Accounting
const mockTransactions = [
  { id: 'TRX-9821', type: 'payout', amount: 1200.00, status: 'completed', date: '2026-10-15', description: 'Virement mensuel - Octobre' },
  { id: 'TRX-9822', type: 'sale', amount: 450.00, status: 'completed', date: '2026-10-18', description: 'Ventes Semaine 42' },
  { id: 'TRX-9823', type: 'sale', amount: 890.00, status: 'completed', date: '2026-10-25', description: 'Ventes Semaine 43' },
  { id: 'TRX-9824', type: 'payout', amount: 500.00, status: 'processing', date: '2026-11-01', description: 'Demande de retrait #45' },
  { id: 'TRX-9825', type: 'sale', amount: 320.00, status: 'completed', date: '2026-11-02', description: 'Ventes Semaine 44' },
];

export default function AdminAccountingPage() {
  const { toast } = useToast();
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [amountToRequest, setAmountToRequest] = useState('');
  
  // Calculations
  const totalEarned = 15000.00; // Mock total lifetime earnings
  const totalPaid = mockTransactions
    .filter(t => t.type === 'payout' && t.status === 'completed')
    .reduce((acc, t) => acc + t.amount, 0);
  const pendingPayouts = mockTransactions
    .filter(t => t.type === 'payout' && t.status === 'processing')
    .reduce((acc, t) => acc + t.amount, 0);
    
  const currentBalance = totalEarned - totalPaid - pendingPayouts;

  const handleRequestPayout = () => {
      const amount = parseFloat(amountToRequest);
      if (isNaN(amount) || amount <= 0) {
          toast({ variant: "destructive", title: "Montant invalide", description: "Veuillez entrer un montant positif." });
          return;
      }
      if (amount > currentBalance) {
          toast({ variant: "destructive", title: "Solde insuffisant", description: "Vous ne pouvez pas retirer plus que votre solde actuel." });
          return;
      }

      // In a real app, this would make an API call
      toast({ title: "Demande envoyée", description: `Une demande de virement de ${amount.toFixed(2)} TND a été créée.` });
      setIsRequestOpen(false);
      setAmountToRequest('');
      // Optimistically update UI could go here
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold font-headline text-foreground">Comptabilité & Finances</h1>
        <p className="text-muted-foreground">
          Suivez vos revenus, vos virements et votre solde en temps réel.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-white/5 bg-card/50 backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Solde Disponible</CardTitle>
              <Wallet className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-headline text-foreground">{currentBalance.toFixed(2)} TND</div>
              <p className="text-xs text-muted-foreground mt-1">Prêt à être retiré</p>
            </CardContent>
        </Card>

        <Card className="border-white/5 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">En cours de traitement</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-headline text-foreground">{pendingPayouts.toFixed(2)} TND</div>
              <p className="text-xs text-muted-foreground mt-1">Virements demandés</p>
            </CardContent>
        </Card>

        <Card className="border-white/5 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Reçu</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-headline text-foreground">{totalPaid.toFixed(2)} TND</div>
              <p className="text-xs text-muted-foreground mt-1">Virements effectués à ce jour</p>
            </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-end">
          <Dialog open={isRequestOpen} onOpenChange={setIsRequestOpen}>
              <DialogTrigger asChild>
                  <Button className="bg-gradient-primary hover:opacity-90 shadow-glow-sm">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Demander un Virement
                  </Button>
              </DialogTrigger>
              <DialogContent className="glass-strong border-white/10">
                  <DialogHeader>
                      <DialogTitle>Demander un virement</DialogTitle>
                      <DialogDescription>
                          Le montant sera transféré sur votre compte bancaire enregistré sous 3-5 jours ouvrés.
                      </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                          <Label htmlFor="amount">Montant (TND)</Label>
                          <Input 
                              id="amount" 
                              type="number" 
                              placeholder="0.00" 
                              value={amountToRequest} 
                              onChange={(e) => setAmountToRequest(e.target.value)}
                              className="bg-white/5 border-white/10"
                          />
                          <p className="text-xs text-muted-foreground">Solde max: {currentBalance.toFixed(2)} TND</p>
                      </div>
                  </div>
                  <DialogFooter>
                      <Button onClick={handleRequestPayout} className="bg-gradient-primary">Confirmer la demande</Button>
                  </DialogFooter>
              </DialogContent>
          </Dialog>
      </div>

      {/* Transaction History */}
      <Card className="border-white/5 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Historique des Transactions</CardTitle>
          <CardDescription>
            Liste détaillée de tous les mouvements financiers (ventes et virements).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-white/5">
                <TableHead>Référence</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead className="text-center">Statut</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.map((trx) => (
                <TableRow key={trx.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell className="font-mono text-xs text-muted-foreground">{trx.id}</TableCell>
                  <TableCell>
                      {trx.type === 'payout' ? (
                          <Badge variant="outline" className="border-red-500/20 text-red-400 bg-red-500/10 hover:bg-red-500/20">Sortie</Badge>
                      ) : (
                          <Badge variant="outline" className="border-green-500/20 text-green-400 bg-green-500/10 hover:bg-green-500/20">Entrée</Badge>
                      )}
                  </TableCell>
                  <TableCell className="text-foreground">{trx.description}</TableCell>
                  <TableCell className={`text-right font-bold ${trx.type === 'payout' ? 'text-red-400' : 'text-green-400'}`}>
                    {trx.type === 'payout' ? '-' : '+'}{trx.amount.toFixed(2)} TND
                  </TableCell>
                  <TableCell className="text-center">
                    {trx.status === 'completed' ? (
                        <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-0">Complété</Badge>
                    ) : (
                        <Badge className="bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border-0">En cours</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-sm">
                    {new Date(trx.date).toLocaleDateString('fr-FR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
