
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
import { SalesChart } from "@/components/super-admin/sales-chart";
import { DollarSign, Ticket, Users, TrendingUp, Calendar, CreditCard } from "lucide-react";
import { events, users } from "@/lib/placeholder-data";
import { Badge } from "@/components/ui/badge";

export default function AdminSalesPage() {
  const allSales = users.flatMap(user =>
    user.purchasedTickets.map(ticket => {
      const event = events.find(e => e.id === ticket.eventId);
      return {
        userName: user.name,
        userEmail: user.email,
        eventName: event?.name || 'Événement inconnu',
        eventCategory: event?.category || 'Autre',
        eventPrice: event?.price || 0,
        purchaseDate: ticket.purchaseDate,
        ticketId: ticket.ticketId,
      };
    })
  ).sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());

  const totalRevenue = allSales.reduce((sum, sale) => sum + sale.eventPrice, 0);
  const totalTicketsSold = allSales.length;
  const averageTicketPrice = totalTicketsSold > 0 ? totalRevenue / totalTicketsSold : 0;
  
  // Calculate category stats
  const categoryStats = allSales.reduce((acc, sale) => {
      acc[sale.eventCategory] = (acc[sale.eventCategory] || 0) + sale.eventPrice;
      return acc;
  }, {} as Record<string, number>);
  
  const topCategory = Object.entries(categoryStats).sort((a, b) => b[1] - a[1])[0];

  const stats = [
    {
      title: "Revenu Total",
      value: `${totalRevenue.toFixed(2)} TND`,
      icon: DollarSign,
      description: "+20.1% par rapport au mois dernier",
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Billets Vendus",
      value: `+${totalTicketsSold}`,
      icon: Ticket,
      description: "+15% par rapport au mois dernier",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Prix Moyen",
      value: `${averageTicketPrice.toFixed(2)} TND`,
      icon: CreditCard,
      description: "Moyenne par transaction",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
        title: "Top Catégorie",
        value: topCategory ? topCategory[0] : "N/A",
        icon: TrendingUp,
        description: `${topCategory ? topCategory[1] : 0} TND de revenus`,
        color: "text-orange-500",
        bgColor: "bg-orange-500/10"
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold font-headline text-foreground">Tableau de Bord des Ventes</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble détaillée des performances financières et des transactions.
        </p>
      </div>

      {/* Stats Cards with Animations */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-white/5 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-headline text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
        {/* Recent Sales Table */}
        <div className="lg:col-span-4 space-y-4">
            <Card className="border-white/5 bg-card/50 backdrop-blur-sm h-full">
                <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Transactions Récentes
                </CardTitle>
                <CardDescription>
                    Les 10 dernières ventes de billets enregistrées.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow className="border-white/5 hover:bg-white/5">
                        <TableHead>Événement & Client</TableHead>
                        <TableHead className="text-right">Montant</TableHead>
                        <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {allSales.slice(0, 10).map((sale) => (
                        <TableRow key={sale.ticketId} className="border-white/5 hover:bg-white/5 transition-colors">
                        <TableCell>
                            <div className="flex flex-col">
                                <span className="font-medium text-foreground">{sale.eventName}</span>
                                <span className="text-xs text-muted-foreground">{sale.userEmail}</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-right text-foreground font-semibold">{sale.eventPrice.toFixed(2)} TND</TableCell>
                        <TableCell className="text-right">
                            <Badge variant="secondary" className="bg-white/5 hover:bg-white/10 text-muted-foreground font-normal">
                                {new Date(sale.purchaseDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                            </Badge>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </div>

        {/* Chart Section */}
        <div className="lg:col-span-3">
            <Card className="border-white/5 bg-card/50 backdrop-blur-sm h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-fuchsia-400" />
                        Analyse des Revenus
                    </CardTitle>
                    <CardDescription>Évolution des ventes sur la période.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 min-h-[300px] flex items-center justify-center">
                    <SalesChart />
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
