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
import { useState, useEffect } from "react";
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
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function AdminAccountingPage() {
  const { toast } = useToast();
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [amountToRequest, setAmountToRequest] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [pendingPayouts, setPendingPayouts] = useState(0);
  const supabase = createClient();

  // Fetch transactions from database
  useEffect(() => {
    fetchTransactions();

    const channel = supabase
      .channel('transactions-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        (payload) => {
          console.log('Change received!', payload);
          // Refetch transactions on any change
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('admin_id', user.id)
        .order('created_at', { ascending: false });

      if (transactionsError) throw transactionsError;

      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('total_earned, total_paid')
        .eq('id', user.id)
        .maybeSingle();

      setTransactions(transactionsData || []);

      if (!adminError && adminData) {
        setTotalPaid(adminData.total_paid || 0);
        setCurrentBalance((adminData.total_earned || 0) - (adminData.total_paid || 0));
      } else {
        const totalSales = (transactionsData || [])
          .filter(t => t.type === 'sale' && t.status === 'completed')
          .reduce((acc, t) => acc + (t.amount || 0), 0);
        const totalPayouts = (transactionsData || [])
          .filter(t => t.type === 'payout' && t.status === 'completed')
          .reduce((acc, t) => acc + (t.amount || 0), 0);
        setTotalPaid(totalPayouts);
        setCurrentBalance(totalSales - totalPayouts);
      }
      
      // Calculate pending payouts
      const pending = transactionsData?.filter(t => t.type === 'payout' && t.status === 'processing') || [];
      const pendingTotal = pending.reduce((acc, t) => acc + (t.amount || 0), 0);
      setPendingPayouts(pendingTotal);

    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Erreur", 
        description: error.message || "Impossible de charger les données financières" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async () => {
      const amount = parseFloat(amountToRequest);
      if (isNaN(amount) || amount <= 0) {
          toast({ variant: "destructive", title: "Montant invalide", description: "Veuillez entrer un montant positif." });
          return;
      }
      if (amount > currentBalance) {
          toast({ variant: "destructive", title: "Solde insuffisant", description: "Vous ne pouvez pas retirer plus que votre solde actuel." });
          return;
      }

      try {
        // Create payout transaction
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not found');

        const { error: payoutError } = await supabase
          .from('transactions')
          .insert([{
            type: 'payout',
            amount: amount,
            status: 'processing',
            description: `Demande de retrait - ${new Date().toLocaleDateString('fr-FR')}`,
            admin_id: user.id
          }]);

        if (payoutError) throw payoutError;

        toast({ title: "Demande envoyée", description: `Une demande de virement de ${amount.toFixed(2)} TND a été créée.` });
        setIsRequestOpen(false);
        setAmountToRequest('');
        
        // Refresh data
        fetchTransactions();
      } catch (error: any) {
        toast({ variant: "destructive", title: "Erreur", description: error.message || "Impossible de créer la demande de virement" });
      }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold font-headline text-foreground">Comptabilité & Finances</h1>
        <p className="text-muted-foreground">
          Suivez vos revenus, vos virements et votre solde en temps réel.
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          <span className="ml-2 text-muted-foreground">Chargement des données financières...</span>
        </div>
      )}

      {/* Overview Cards */}
      {!loading && (
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
      )}

      {/* Actions */}
      {!loading && (
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
      )}

      {/* Transaction History */}
      {!loading && (
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
                {transactions.map((trx) => (
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
                      {new Date(trx.created_at || trx.date).toLocaleDateString('fr-FR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
