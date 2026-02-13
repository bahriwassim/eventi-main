"use client";

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
import { events, users } from "@/lib/placeholder-data";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Percent, TrendingUp, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function SuperAdminCommissionsPage() {
  const { toast } = useToast();
  // Settings state
  const [tier1Rate, setTier1Rate] = useState(4); // > 3000 tickets
  const [tier2Rate, setTier2Rate] = useState(5); // > 1000 tickets
  const [tier3Rate, setTier3Rate] = useState(6); // < 1000 tickets

  // Calculate commission based on ticket sales volume (mocked here by random number or price)
  // Let's assume ticket count is roughly revenue / price for demo, or just mock it.
  const commissionData = events.map(event => {
    const ticketCount = Math.floor(Math.random() * 4000); // Random ticket count between 0 and 4000
    const revenue = ticketCount * event.price;
    
    let rate = 0;
    if (ticketCount > 3000) rate = tier1Rate / 100;
    else if (ticketCount > 1000) rate = tier2Rate / 100;
    else rate = tier3Rate / 100;

    const admin = users.find(u => u.email.includes('admin'));

    return {
      eventId: event.id,
      eventName: event.name,
      adminName: admin?.name || 'N/A',
      ticketCount: ticketCount,
      revenue: revenue,
      commissionRate: rate,
      commissionEarned: revenue * rate,
    };
  });

  const totalCommissions = commissionData.reduce((sum, item) => sum + item.commissionEarned, 0);
  const averageRate = commissionData.reduce((sum, item) => sum + item.commissionRate, 0) / commissionData.length;

  const handleSaveSettings = () => {
    toast({ title: "Paramètres de commission mis à jour", description: "Les nouveaux taux seront appliqués aux prochains calculs." });
  };

  const stats = [
    { title: "Commissions Totales", value: `${totalCommissions.toFixed(2)} TND`, icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10" },
    { title: "Taux Moyen", value: `${(averageRate * 100).toFixed(2)}%`, icon: Percent, color: "text-purple-400", bg: "bg-purple-500/10" },
    { title: "Événement le Plus Rentable", value: commissionData.sort((a, b) => b.commissionEarned - a.commissionEarned)[0]?.eventName || "N/A", icon: TrendingUp, color: "text-fuchsia-400", bg: "bg-fuchsia-500/10" },
  ];

  return (
    <div className="animate-fade-in-up space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline mb-2 text-foreground">Gestion des Commissions</h1>
        <p className="text-muted-foreground">
            Suivez et gérez les commissions générées par les organisateurs.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index} className="border-white/5 bg-card/50 backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: `${index * 80}ms` }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate font-headline text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Card className="border-white/5 bg-card/50 backdrop-blur-sm h-full">
                <CardHeader>
                <CardTitle className="text-foreground">Détail des Commissions par Événement</CardTitle>
                <CardDescription>
                    Liste de toutes les commissions ventilées par événement.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow className="border-white/5 hover:bg-white/5">
                        <TableHead>Événement</TableHead>
                        <TableHead>Billets</TableHead>
                        <TableHead className="text-right">Revenu Brut</TableHead>
                        <TableHead className="text-center">Taux</TableHead>
                        <TableHead className="text-right">Commission Due</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {commissionData.map((item) => (
                        <TableRow key={item.eventId} className="border-white/5 hover:bg-white/5 transition-colors">
                        <TableCell className="font-medium text-foreground">{item.eventName}</TableCell>
                        <TableCell className="text-muted-foreground">{item.ticketCount}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{item.revenue.toFixed(2)} TND</TableCell>
                        <TableCell className="text-center">
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{(item.commissionRate * 100).toFixed(1)}%</Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-primary">{item.commissionEarned.toFixed(2)} TND</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </div>

        <div>
            <Card className="border-white/5 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                        <Settings className="h-5 w-5" />
                        Configuration Taux
                    </CardTitle>
                    <CardDescription>Définir les paliers de commission.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Plus de 3000 tickets</label>
                        <div className="relative">
                            <Input 
                                type="number" 
                                value={tier1Rate} 
                                onChange={(e) => setTier1Rate(Number(e.target.value))}
                                className="bg-white/5 border-white/10 pr-8" 
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Plus de 1000 tickets</label>
                        <div className="relative">
                            <Input 
                                type="number" 
                                value={tier2Rate} 
                                onChange={(e) => setTier2Rate(Number(e.target.value))}
                                className="bg-white/5 border-white/10 pr-8" 
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Moins de 1000 tickets</label>
                        <div className="relative">
                            <Input 
                                type="number" 
                                value={tier3Rate} 
                                onChange={(e) => setTier3Rate(Number(e.target.value))}
                                className="bg-white/5 border-white/10 pr-8" 
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                        </div>
                    </div>
                    <Button onClick={handleSaveSettings} className="w-full bg-gradient-primary mt-4">Sauvegarder</Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
