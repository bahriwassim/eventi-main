import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, Ticket, Activity, ArrowUp } from "lucide-react";

const stats = [
  {
    title: "Revenu Total",
    value: "135,695.67 TND",
    change: "+20.1% depuis le mois dernier",
    icon: DollarSign,
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    title: "Billets Vendus",
    value: "+2350",
    change: "+180.1% depuis le mois dernier",
    icon: Ticket,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    title: "Événements Actifs",
    value: "12",
    change: "+2 depuis le mois dernier",
    icon: Activity,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    title: "Nouveaux Utilisateurs",
    value: "+573",
    change: "+19% depuis le mois dernier",
    icon: ArrowUp,
    color: "text-fuchsia-400",
    bg: "bg-fuchsia-500/10",
  },
];

export function OverviewStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="border-white/5 bg-card/50 backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: `${index * 80}ms` }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg ${stat.bg}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline text-foreground">{stat.value}</div>
            <p className="text-xs text-green-400 mt-1">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
