'use client';

import { useState } from 'react';
import { events } from '@/lib/placeholder-data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, UserPlus, Users, QrCode, CheckCircle, XCircle, ShoppingCart } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast";

// Mock data for personnel
const allPersonnel = [
  { id: 'gp-1', name: 'Ali Ben Salah', email: 'ali.salah@gate.com' },
  { id: 'gp-2', name: 'Fatma Khemir', email: 'fatma.khemir@gate.com' },
  { id: 'gp-3', name: 'Mehdi Jouini', email: 'mehdi.jouini@gate.com' },
  { id: 'gp-4', name: 'Aicha Trabelsi', email: 'aicha.trabelsi@gate.com' },
];

// Mock data for customers per event
const mockCustomers = {
    '1': [
        { id: 'c1', name: 'Sami Tounsi', email: 'sami.t@example.com', tickets: 2, amount: 90 },
        { id: 'c2', name: 'Leila Ben Amor', email: 'leila.b@example.com', tickets: 1, amount: 45 },
    ],
    '9': [
        { id: 'c3', name: 'Karim Jaziri', email: 'karim.j@example.com', tickets: 4, amount: 320 },
    ],
    '10': [],
};

const initialAssignments = {
  '1': [allPersonnel[0], allPersonnel[1]],
  '9': [allPersonnel[2], allPersonnel[3]],
  '10': [allPersonnel[0], allPersonnel[3]],
};

// Mock statistics for scans
const scanStats = {
  '1': { valid: 1450, invalid: 23, total: 3000 },
  '9': { valid: 850, invalid: 12, total: 1500 },
  '10': { valid: 2100, invalid: 45, total: 5000 },
};

export default function AdminEventsPage() {
  const [assignments, setAssignments] = useState(initialAssignments);
  const { toast } = useToast();

  const getAssignedPersonnel = (eventId: string) => {
    return assignments[eventId as keyof typeof assignments] || [];
  }

  const handleDeletePersonnel = (eventId: string, personnelId: string) => {
    setAssignments(prev => ({
      ...prev,
      [eventId]: (prev[eventId as keyof typeof assignments] || []).filter(p => p.id !== personnelId)
    }));
    toast({ title: "Personnel retiré", description: "L'accès a été révoqué pour cet événement." });
  };

  const handleAddPersonnel = (eventId: string, personnelId: string) => {
    const person = allPersonnel.find(p => p.id === personnelId);
    if (person) {
      setAssignments(prev => {
        const currentList = prev[eventId as keyof typeof assignments] || [];
        if (currentList.find(p => p.id === personnelId)) {
            toast({ variant: "destructive", title: "Erreur", description: "Ce membre est déjà assigné." });
            return prev;
        }
        toast({ title: "Personnel ajouté", description: "Accès accordé avec succès." });
        return {
          ...prev,
          [eventId]: [...currentList, person]
        };
      });
    }
  };

  return (
    <div className="animate-fade-in-up space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline mb-2 text-foreground">Gestion des Accès</h1>
        <p className="text-muted-foreground">
          Assignez le personnel de contrôle et suivez les statistiques d&apos;entrée.
        </p>
      </div>

      <div className="space-y-6">
        {events.map((event, index) => {
            const stats = scanStats[event.id as keyof typeof scanStats] || { valid: 0, invalid: 0, total: 0 };
            const progress = stats.total > 0 ? (stats.valid / stats.total) * 100 : 0;

            return (
            <Card key={event.id} className="border-white/5 bg-card/50 backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: `${index * 80}ms` }}>
                <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-foreground text-xl mb-1">{event.name}</CardTitle>
                        <CardDescription>Le {new Date(event.date).toLocaleDateString('fr-FR')} à {event.location}</CardDescription>
                    </div>
                    <div className="flex gap-4 text-sm">
                        <div className="flex flex-col items-end">
                            <span className="text-muted-foreground flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-400"/> Valides</span>
                            <span className="font-bold text-foreground">{stats.valid}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-muted-foreground flex items-center gap-1"><XCircle className="h-3 w-3 text-red-400"/> Invalides</span>
                            <span className="font-bold text-foreground">{stats.invalid}</span>
                        </div>
                    </div>
                </div>
                </CardHeader>
                <CardContent>
                <div className="mb-6">
                    <div className="flex justify-between text-xs mb-2">
                        <span className="text-muted-foreground">Progression des entrées</span>
                        <span className="text-primary font-medium">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-primary transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                {/* Section Clients */}
                <div className="mb-6">
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
                        <ShoppingCart className="h-5 w-5 text-fuchsia-400" /> 
                        Clients ({mockCustomers[event.id as keyof typeof mockCustomers]?.length || 0})
                    </h4>
                    {mockCustomers[event.id as keyof typeof mockCustomers]?.length > 0 ? (
                         <div className="max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-white/5 hover:bg-white/5">
                                        <TableHead className="h-8 text-xs">Nom</TableHead>
                                        <TableHead className="h-8 text-xs">Email</TableHead>
                                        <TableHead className="h-8 text-xs text-right">Billets</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockCustomers[event.id as keyof typeof mockCustomers].map((customer) => (
                                        <TableRow key={customer.id} className="border-white/5 hover:bg-white/5 text-xs">
                                            <TableCell className="py-2">{customer.name}</TableCell>
                                            <TableCell className="py-2 text-muted-foreground">{customer.email}</TableCell>
                                            <TableCell className="py-2 text-right font-bold">{customer.tickets}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                         </div>
                    ) : (
                        <p className="text-xs text-muted-foreground italic pl-2">Aucun client pour le moment.</p>
                    )}
                </div>

                <h4 className="font-semibold mb-3 flex items-center gap-2 text-muted-foreground"><Users className="h-5 w-5 text-primary" /> Personnel assigné</h4>
                {getAssignedPersonnel(event.id).length > 0 ? (
                    <Table>
                    <TableHeader>
                        <TableRow className="border-white/5 hover:bg-white/5">
                        <TableHead>Nom</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {getAssignedPersonnel(event.id).map(person => (
                        <TableRow key={person.id} className="border-white/5 hover:bg-white/5 transition-colors">
                            <TableCell className="font-medium text-foreground">{person.name}</TableCell>
                            <TableCell className="text-muted-foreground">{person.email}</TableCell>
                            <TableCell className="text-right">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDeletePersonnel(event.id, person.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4 bg-white/5 rounded-lg border border-white/5">
                    Aucun personnel assigné à cet événement.
                    </p>
                )}
                </CardContent>
                <CardFooter>
                <Dialog>
                    <DialogTrigger asChild>
                    <Button className="bg-gradient-primary hover:opacity-90 transition-opacity border-0">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Ajouter du personnel
                    </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-strong border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-foreground">Ajouter du personnel à &quot;{event.name}&quot;</DialogTitle>
                        <DialogDescription>
                        Sélectionnez un membre du personnel à ajouter à cet événement.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Select onValueChange={(value) => handleAddPersonnel(event.id, value)}>
                        <SelectTrigger className="bg-white/5 border-white/10">
                            <SelectValue placeholder="Sélectionner un membre du personnel" />
                        </SelectTrigger>
                        <SelectContent className="glass-strong border-white/10">
                            {allPersonnel.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name} ({p.email})</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    </div>
                    </DialogContent>
                </Dialog>
                </CardFooter>
            </Card>
            );
        })}
      </div>
    </div>
  );
}
