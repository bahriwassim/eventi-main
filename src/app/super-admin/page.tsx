"use client";

import { OverviewStats } from "@/components/super-admin/overview-stats";
import { SalesChart } from "@/components/super-admin/sales-chart";
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
import { events } from "@/lib/placeholder-data";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function SuperAdminOverviewPage() {
  const { toast } = useToast();
  // Mock payment requests
  const [paymentRequests, setPaymentRequests] = useState([
    { id: '1', adminName: 'Admin Eventi', amount: 450.00, status: 'pending', date: '2024-05-20' },
    { id: '2', adminName: 'Organisateur Sousse', amount: 1250.00, status: 'pending', date: '2024-05-21' },
  ]);

  const handleApprove = (id: string) => {
    setPaymentRequests(prev => prev.filter(req => req.id !== id));
    toast({ title: "Paiement approuvé", description: "Le virement a été initié." });
  };

  const handleReject = (id: string) => {
    setPaymentRequests(prev => prev.filter(req => req.id !== id));
    toast({ variant: "destructive", title: "Paiement rejeté", description: "L'admin a été notifié." });
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold font-headline text-foreground">Aperçu Super Admin</h1>
        <p className="text-muted-foreground">
          Une vue d&apos;ensemble des performances et des finances de la plateforme.
        </p>
      </div>

      <OverviewStats />

      {/* Payment Requests Section */}
      {paymentRequests.length > 0 && (
        <Card className="border-white/5 bg-card/50 backdrop-blur-sm border-l-4 border-l-yellow-500">
            <CardHeader>
                <CardTitle className="text-foreground">Demandes de Paiement en Attente</CardTitle>
                <CardDescription>Validez les demandes de retrait des organisateurs.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/5 hover:bg-white/5">
                            <TableHead>Admin</TableHead>
                            <TableHead>Montant</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paymentRequests.map((req) => (
                            <TableRow key={req.id} className="border-white/5 hover:bg-white/5">
                                <TableCell className="font-medium text-foreground">{req.adminName}</TableCell>
                                <TableCell className="font-bold text-green-400">{req.amount.toFixed(2)} TND</TableCell>
                                <TableCell className="text-muted-foreground">{req.date}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button size="sm" onClick={() => handleApprove(req.id)} className="bg-green-600 hover:bg-green-700 text-white h-8 w-8 p-0 rounded-full">
                                            <Check className="h-4 w-4" />
                                        </Button>
                                        <Button size="sm" onClick={() => handleReject(req.id)} variant="destructive" className="h-8 w-8 p-0 rounded-full">
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <Card className="border-white/5 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-foreground">Événements les Plus Performants</CardTitle>
            <CardDescription>Événements avec les ventes de billets les plus élevées.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-white/5">
                  <TableHead>Événement</TableHead>
                  <TableHead className="text-right">Ventes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.slice(0, 5).map(event => (
                  <TableRow key={event.id} className="border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="font-medium text-foreground">{event.name}</TableCell>
                    <TableCell className="text-right font-semibold text-primary">{(Math.random() * 30000 + 15000).toFixed(2)} TND</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
