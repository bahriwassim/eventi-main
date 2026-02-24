'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, UserPlus, Users, CheckCircle, XCircle, ShoppingCart, Loader2 } from 'lucide-react';
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
import { createClient } from '@/lib/supabase/client';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [personnelMap, setPersonnelMap] = useState<Record<string, any[]>>({});
  const [statsMap, setStatsMap] = useState<Record<string, any>>({});
  const [newPersonnelEmail, setNewPersonnelEmail] = useState('');
  const [addingPersonnel, setAddingPersonnel] = useState(false);
  
  const { toast } = useToast();
  const supabase = createClient();

  const fetchData = async () => {
      try {
          const { data: eventsData, error } = await supabase
              .from('events')
              .select('*, tickets(status)')
              .order('date', { ascending: true });
          
          if (error) throw error;
          
          if (eventsData) {
              setEvents(eventsData);
              
              // Calculate stats
              const newStats: Record<string, any> = {};
              eventsData.forEach(event => {
                  const tickets = event.tickets || [];
                  const total = tickets.length;
                  const used = tickets.filter((t: any) => t.status === 'used').length;
                  const valid = tickets.filter((t: any) => t.status === 'valid').length;
                  // Assume 'invalid' are refunded or other statuses, or maybe failed scans (not tracked in DB usually)
                  // For now, let's just show Valid vs Used (Entered)
                  newStats[event.id] = {
                      total,
                      entered: used,
                      valid: valid, // 'valid' means purchased but not yet entered
                      invalid: 0 // We don't track invalid scans in DB yet
                  };
              });
              setStatsMap(newStats);

              // Fetch personnel
              const { data: personnelData } = await supabase
                  .from('gate_personnel')
                  .select('*');
              
              const newPersonnelMap: Record<string, any[]> = {};
              if (personnelData) {
                  personnelData.forEach(p => {
                      if (!newPersonnelMap[p.event_id]) {
                          newPersonnelMap[p.event_id] = [];
                      }
                      newPersonnelMap[p.event_id].push(p);
                  });
              }
              setPersonnelMap(newPersonnelMap);
          }
      } catch (err: any) {
          console.error("Error fetching data", err);
          toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les données." });
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchData();
  }, []);

  const handleAddPersonnel = async (eventId: string) => {
      if (!newPersonnelEmail) return;
      
      setAddingPersonnel(true);
      try {
          const { data: { user } } = await supabase.auth.getUser();
          
          const { data, error } = await supabase.from('gate_personnel').insert({
              event_id: eventId,
              email: newPersonnelEmail,
              added_by: user?.id
          }).select().single();

          if (error) throw error;

          setPersonnelMap(prev => ({
              ...prev,
              [eventId]: [...(prev[eventId] || []), data]
          }));
          
          setNewPersonnelEmail('');
          toast({ title: "Personnel ajouté", description: "Accès accordé avec succès." });
      } catch (err: any) {
           console.error("Error adding personnel", err);
           toast({ variant: "destructive", title: "Erreur", description: err.message });
      } finally {
          setAddingPersonnel(false);
      }
  };

  const handleDeletePersonnel = async (eventId: string, personnelId: string) => {
      try {
          const { error } = await supabase.from('gate_personnel').delete().eq('id', personnelId);
          if (error) throw error;

          setPersonnelMap(prev => ({
              ...prev,
              [eventId]: (prev[eventId] || []).filter(p => p.id !== personnelId)
          }));
          toast({ title: "Personnel retiré", description: "L'accès a été révoqué." });
      } catch (err: any) {
           console.error("Error deleting personnel", err);
           toast({ variant: "destructive", title: "Erreur", description: err.message });
      }
  };

  if (loading) {
      return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

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
            const stats = statsMap[event.id] || { entered: 0, valid: 0, total: 0 };
            const progress = stats.total > 0 ? (stats.entered / stats.total) * 100 : 0;
            const personnel = personnelMap[event.id] || [];

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
                            <span className="text-muted-foreground flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-400"/> Entrés</span>
                            <span className="font-bold text-foreground">{stats.entered}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3 text-blue-400"/> Total Vendus</span>
                            <span className="font-bold text-foreground">{stats.total}</span>
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

                <h4 className="font-semibold mb-3 flex items-center gap-2 text-muted-foreground"><Users className="h-5 w-5 text-primary" /> Personnel assigné</h4>
                {personnel.length > 0 ? (
                    <Table>
                    <TableHeader>
                        <TableRow className="border-white/5 hover:bg-white/5">
                        <TableHead>Email</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {personnel.map((person: any) => (
                        <TableRow key={person.id} className="border-white/5 hover:bg-white/5 transition-colors">
                            <TableCell className="font-medium text-foreground">{person.email}</TableCell>
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
                        Entrez l&apos;adresse email du membre du personnel.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input 
                                id="email" 
                                placeholder="email@exemple.com" 
                                value={newPersonnelEmail}
                                onChange={(e) => setNewPersonnelEmail(e.target.value)}
                                className="bg-white/5 border-white/10"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => handleAddPersonnel(event.id)} disabled={addingPersonnel || !newPersonnelEmail} className="bg-gradient-primary">
                            {addingPersonnel ? "Ajout..." : "Ajouter"}
                        </Button>
                    </DialogFooter>
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
