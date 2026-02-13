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
import { events } from "@/lib/placeholder-data";
import { PlusCircle, Edit, Trash2, Download, DollarSign, X, Upload, FileText, Eye } from "lucide-react";
import * as XLSX from 'xlsx';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

// Mock clients data generator
const generateMockClients = (eventId: string, count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
        id: `client-${eventId}-${i}`,
        name: `Client ${i + 1}`,
        email: `client${i + 1}@example.com`,
        ticketType: i % 3 === 0 ? 'VIP' : (i % 2 === 0 ? 'Gradin' : 'Standard'),
        price: i % 3 === 0 ? 150 : (i % 2 === 0 ? 80 : 50),
        purchaseDate: new Date().toISOString()
    }));
};

const DEFAULT_CATEGORIES = [
  { id: 'default_1', name: 'Musique' },
  { id: 'default_2', name: 'Culture' },
  { id: 'default_3', name: 'Art' },
  { id: 'default_4', name: 'Conférence' },
  { id: 'default_5', name: 'Gastronomie' },
  { id: 'default_6', name: 'Mode' },
  { id: 'default_7', name: 'Football' },
  { id: 'default_8', name: 'Volleyball' },
  { id: 'default_9', name: 'Basketball' },
  { id: 'default_10', name: 'Théâtre' },
  { id: 'default_11', name: 'Cinéma' },
];

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const [requestStatus, setRequestStatus] = useState<'idle' | 'pending' | 'approved'>('idle');
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [eventClients, setEventClients] = useState<any[]>([]);

  const [ticketTypes, setTicketTypes] = useState<{name: string, price: string, capacity: string}[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>(DEFAULT_CATEGORIES);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [newEvent, setNewEvent] = useState({
    name: '',
    category: '',
    date: '',
    time: '',
    location: '',
    price: '',
    capacity: '',
    description: '',
    image_url: ''
  });
  const supabase = createClient();

  useEffect(() => {
      fetchCategories();
  }, []);

  const fetchCategories = async () => {
      // Force loading default categories first to avoid empty state
      setCategories(DEFAULT_CATEGORIES);
      
      try {
        const { data, error } = await supabase.from('categories').select('*').order('name');
        if (!error && data && data.length > 0) {
            setCategories(data);
        }
      } catch (err) {
          console.warn("Using default categories due to fetch error");
      }
  };

  const handleEditClick = async (event: any) => {
    setEditingEvent(event);
    setNewEvent({
      name: event.name,
      category: event.category,
      date: new Date(event.date).toISOString().split('T')[0],
      time: event.time || '',
      location: event.location,
      price: event.price.toString(),
      capacity: event.capacity ? event.capacity.toString() : '100',
      description: event.description || '',
      image_url: event.image_url || ''
    });
    setPosterFile(null);
    
    // Fetch ticket types
    const { data } = await supabase.from('ticket_types').select('*').eq('event_id', event.id);
    if (data && data.length > 0) {
        setTicketTypes(data.map(t => ({ name: t.name, price: t.price.toString(), capacity: t.capacity.toString() })));
    } else {
        setTicketTypes([]);
    }
    
    setIsAddEventOpen(true);
  };

  const handleDetailsClick = (event: any) => {
      setSelectedEvent(event);
      // Generate mock clients for this event
      const salesCount = Math.floor(Math.random() * (event.capacity || 100));
      setEventClients(generateMockClients(event.id, salesCount));
      setIsDetailsOpen(true);
  };

  const handleAddTicketType = () => {
      setTicketTypes([...ticketTypes, { name: '', price: '', capacity: '' }]);
  };

  const handleRemoveTicketType = (index: number) => {
      const newTypes = [...ticketTypes];
      newTypes.splice(index, 1);
      setTicketTypes(newTypes);
  };

  const handleTicketTypeChange = (index: number, field: keyof typeof ticketTypes[0], value: string) => {
      const newTypes = [...ticketTypes];
      newTypes[index][field] = value;
      setTicketTypes(newTypes);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setPosterFile(e.target.files[0]);
      }
  };

  const handleAddEvent = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Utilisateur non connecté");

        if (!posterFile && !editingEvent && !newEvent.image_url) {
            toast({ variant: "destructive", title: "Image manquante", description: "Veuillez télécharger une affiche pour l'événement." });
            return;
        }

        setUploading(true);
        let imageUrl = newEvent.image_url;

        // Upload Image if selected
        if (posterFile) {
            const fileExt = posterFile.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('event-posters')
                .upload(fileName, posterFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('event-posters')
                .getPublicUrl(fileName);
            
            imageUrl = publicUrl;
        }

        const eventData = {
            name: newEvent.name,
            category: newEvent.category,
            date: newEvent.date,
            time: newEvent.time,
            location: newEvent.location,
            price: parseFloat(newEvent.price),
            capacity: parseInt(newEvent.capacity) || 100,
            description: newEvent.description,
            image_url: imageUrl,
            admin_id: user.id
        };

        let error;
        let eventId;

        if (editingEvent) {
            const { error: updateError } = await supabase
                .from('events')
                .update(eventData)
                .eq('id', editingEvent.id);
            error = updateError;
            eventId = editingEvent.id;
        } else {
            const { data: insertedEvent, error: insertError } = await supabase
                .from('events')
                .insert([eventData])
                .select()
                .single();
            error = insertError;
            eventId = insertedEvent?.id;
        }

        if (error) throw error;

        // Handle Ticket Types
        if (eventId && ticketTypes.length > 0) {
            if (editingEvent) {
                await supabase.from('ticket_types').delete().eq('event_id', eventId);
            }

            const typesToInsert = ticketTypes.map(t => ({
                event_id: eventId,
                name: t.name,
                price: parseFloat(t.price),
                capacity: parseInt(t.capacity),
                remaining: parseInt(t.capacity)
            }));

            const { error: typesError } = await supabase.from('ticket_types').insert(typesToInsert);
            if (typesError) throw typesError;
        }

        toast({ title: editingEvent ? "Événement modifié" : "Événement ajouté", description: "L'opération a réussi." });
        setIsAddEventOpen(false);
        setEditingEvent(null);
        setTicketTypes([]);
        setPosterFile(null);
        setNewEvent({
            name: '',
            category: '',
            date: '',
            time: '',
            location: '',
            price: '',
            capacity: '',
            description: '',
            image_url: ''
        });
        window.location.reload();
    } catch (error: any) {
        console.error('Error adding/editing event:', error);
        toast({ variant: "destructive", title: "Erreur", description: error.message });
    } finally {
        setUploading(false);
    }
  };

  const handleDownloadAll = () => {
    const ws = XLSX.utils.json_to_sheet(events.map(e => ({
      ID: e.id,
      Nom: e.name,
      Catégorie: e.category,
      Date: new Date(e.date).toLocaleDateString(),
      Lieu: e.location,
      Prix: e.price,
      Capacité: e.capacity || 100
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tous les Événements");
    XLSX.writeFile(wb, "tous_evenements_admin.xlsx");
    toast({ title: "Téléchargement global démarré" });
  };

  const handleDownloadEventClients = () => {
      if (!selectedEvent) return;
      const ws = XLSX.utils.json_to_sheet(eventClients.map(c => ({
          ID_Client: c.id,
          Nom: c.name,
          Email: c.email,
          Type_Billet: c.ticketType,
          Prix_Payé: c.price,
          Date_Achat: new Date(c.purchaseDate).toLocaleString()
      })));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Clients");
      XLSX.writeFile(wb, `clients_${selectedEvent.name.replace(/\s+/g, '_')}.xlsx`);
      toast({ title: "Téléchargement liste clients démarré" });
  };

  const handlePaymentRequest = () => {
    setRequestStatus('pending');
    toast({ title: "Demande de paiement envoyée", description: "En attente de l'approbation du Super Admin." });
  };

  return (
    <div className="animate-fade-in-up space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">Gestion des Événements</h1>
          <p className="text-muted-foreground">
            Ajouter, modifier ou supprimer des événements.
          </p>
        </div>
        <div className="flex gap-3">
            <Button variant="outline" onClick={handlePaymentRequest} disabled={requestStatus !== 'idle'} className="border-primary/20 hover:bg-primary/10 hover:text-primary">
                <DollarSign className="mr-2 h-4 w-4" />
                {requestStatus === 'idle' ? 'Demander Paiement' : requestStatus === 'pending' ? 'Demande en cours' : 'Payé'}
            </Button>
            <Button variant="outline" onClick={handleDownloadAll} className="border-white/10 hover:bg-white/5">
                <Download className="mr-2 h-4 w-4" />
                Exporter Tout
            </Button>
            <Dialog open={isAddEventOpen} onOpenChange={(open) => {
                setIsAddEventOpen(open);
                if (!open) {
                    setEditingEvent(null);
                    setTicketTypes([]);
                    setPosterFile(null);
                    setNewEvent({
                        name: '',
                        category: '',
                        date: '',
                        time: '',
                        location: '',
                        price: '',
                        capacity: '',
                        description: '',
                        image_url: ''
                    });
                }
            }}>
                <DialogTrigger asChild>
                    <Button className="bg-gradient-primary hover:opacity-90 transition-opacity border-0 shadow-glow-sm">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Ajouter un événement
                    </Button>
                </DialogTrigger>
                <DialogContent className="glass-strong border-white/10 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingEvent ? "Modifier l'événement" : "Ajouter un nouvel événement"}</DialogTitle>
                        <DialogDescription>{editingEvent ? "Modifiez les détails ci-dessous." : "Remplissez les détails de l'événement ci-dessous."}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {/* Poster Upload */}
                        <div className="grid gap-2">
                            <Label htmlFor="poster">Affiche de l&apos;événement (Obligatoire)</Label>
                            <Input id="poster" type="file" accept="image/*" onChange={handleFileChange} className="bg-white/5 border-white/30 cursor-pointer text-foreground" />
                            {newEvent.image_url && (
                                <div className="mt-2 relative w-full h-32 rounded-md overflow-hidden border border-white/30">
                                    <Image src={newEvent.image_url} alt="Aperçu" fill className="object-cover" />
                                </div>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name">Nom</Label>
                            <Input id="name" value={newEvent.name} onChange={(e) => setNewEvent({...newEvent, name: e.target.value})} className="bg-white/5 border-white/30 text-foreground" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="category">Catégorie</Label>
                            <Select value={newEvent.category} onValueChange={(value) => setNewEvent({...newEvent, category: value})}>
                                <SelectTrigger className="bg-white/5 border-white/30 text-foreground">
                                    <SelectValue placeholder="Sélectionner une catégorie" />
                                </SelectTrigger>
                                <SelectContent className="glass-strong border-white/20">
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="price">Prix Standard (TND)</Label>
                                <Input id="price" type="number" value={newEvent.price} onChange={(e) => setNewEvent({...newEvent, price: e.target.value})} className="bg-white/5 border-white/30 text-foreground" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="capacity">Capacité Totale</Label>
                                <Input id="capacity" type="number" value={newEvent.capacity} onChange={(e) => setNewEvent({...newEvent, capacity: e.target.value})} className="bg-white/5 border-white/30 text-foreground" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="date">Date</Label>
                                <Input id="date" type="date" value={newEvent.date} onChange={(e) => setNewEvent({...newEvent, date: e.target.value})} className="bg-white/5 border-white/30 text-foreground" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="time">Heure</Label>
                                <Input id="time" type="time" value={newEvent.time} onChange={(e) => setNewEvent({...newEvent, time: e.target.value})} className="bg-white/5 border-white/30 text-foreground" />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="location">Lieu</Label>
                            <Input id="location" value={newEvent.location} onChange={(e) => setNewEvent({...newEvent, location: e.target.value})} className="bg-white/5 border-white/30 text-foreground" />
                        </div>

                        {/* Ticket Types Section */}
                        <div className="border-t border-white/10 pt-4 mt-2">
                            <div className="flex items-center justify-between mb-3">
                                <Label className="text-base font-semibold">Types de billets (Optionnel)</Label>
                                <Button type="button" variant="outline" size="sm" onClick={handleAddTicketType} className="border-primary/20 text-primary hover:bg-primary/10">
                                    <PlusCircle className="mr-2 h-3 w-3" /> Ajouter
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {ticketTypes.map((type, index) => (
                                    <div key={index} className="flex items-end gap-2 bg-white/5 p-3 rounded-lg border border-white/5">
                                        <div className="grid gap-1 flex-1">
                                            <Label className="text-xs">Nom</Label>
                                            <Input 
                                                value={type.name} 
                                                onChange={(e) => handleTicketTypeChange(index, 'name', e.target.value)}
                                                className="h-8 bg-black/20" 
                                                placeholder="ex: VIP"
                                            />
                                        </div>
                                        <div className="grid gap-1 w-20">
                                            <Label className="text-xs">Prix</Label>
                                            <Input 
                                                type="number"
                                                value={type.price} 
                                                onChange={(e) => handleTicketTypeChange(index, 'price', e.target.value)}
                                                className="h-8 bg-black/20" 
                                                placeholder="DT"
                                            />
                                        </div>
                                        <div className="grid gap-1 w-20">
                                            <Label className="text-xs">Qté</Label>
                                            <Input 
                                                type="number"
                                                value={type.capacity} 
                                                onChange={(e) => handleTicketTypeChange(index, 'capacity', e.target.value)}
                                                className="h-8 bg-black/20" 
                                                placeholder="#"
                                            />
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveTicketType(index)} className="h-8 w-8 text-red-400 hover:bg-red-500/10">
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {ticketTypes.length === 0 && (
                                    <p className="text-xs text-muted-foreground italic text-center py-2">Aucun type de billet spécifique ajouté.</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAddEvent} disabled={uploading} className="bg-gradient-primary">
                            {uploading ? "Chargement..." : "Sauvegarder"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
      </div>

      <Card className="border-white/5 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Tous les Événements</CardTitle>
          <CardDescription>
            Une liste de tous les événements programmés dans le système.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-white/5">
                <TableHead>Nom</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Lieu</TableHead>
                <TableHead className="text-right">Prix (Net)</TableHead>
                <TableHead className="text-center">Ventes</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => {
                // Mock sales data
                const sales = Math.floor(Math.random() * (event.capacity || 100)); 
                const capacity = event.capacity || 100;
                const percentage = Math.round((sales / capacity) * 100);
                
                return (
                <TableRow key={event.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell className="font-medium text-foreground">{event.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{event.category}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(event.date).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{event.location}</TableCell>
                  <TableCell className="text-right text-foreground font-semibold">
                    {(event.price * 0.93).toFixed(2)} TND
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-medium">{sales} / {capacity}</span>
                        <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${percentage}%` }} />
                        </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleDetailsClick(event)} title="Détails & Clients" className="hover:bg-blue-500/10 hover:text-blue-400 transition-colors">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(event)} title="Modifier" className="hover:bg-primary/10 hover:text-primary transition-colors">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteEvent(event.id)} title="Supprimer" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Details & Clients Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="glass-strong border-white/10 max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                  <DialogTitle className="text-2xl flex items-center gap-3">
                      {selectedEvent?.name}
                      <Badge variant="outline" className="text-primary border-primary/50">{selectedEvent?.category}</Badge>
                  </DialogTitle>
                  <DialogDescription>
                      Détails complets et liste des clients pour cet événement.
                  </DialogDescription>
              </DialogHeader>
              
              {selectedEvent && (
                  <div className="space-y-8 py-4">
                      {/* Stats Overview */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card className="bg-white/5 border-white/10">
                              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Revenus Totaux (Est.)</p>
                                  <p className="text-2xl font-bold text-green-400 mt-1">
                                      {(eventClients.reduce((acc, curr) => acc + curr.price, 0)).toFixed(2)} TND
                                  </p>
                              </CardContent>
                          </Card>
                          <Card className="bg-white/5 border-white/10">
                              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Billets Vendus</p>
                                  <p className="text-2xl font-bold text-primary mt-1">
                                      {eventClients.length} / {selectedEvent.capacity || 100}
                                  </p>
                              </CardContent>
                          </Card>
                          <Card className="bg-white/5 border-white/10">
                              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Taux de Remplissage</p>
                                  <p className="text-2xl font-bold text-fuchsia-400 mt-1">
                                      {Math.round((eventClients.length / (selectedEvent.capacity || 100)) * 100)}%
                                  </p>
                              </CardContent>
                          </Card>
                      </div>

                      {/* Client List */}
                      <div>
                          <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-semibold flex items-center gap-2">
                                  <FileText className="h-5 w-5 text-muted-foreground" />
                                  Liste des Clients
                              </h3>
                              <Button variant="outline" size="sm" onClick={handleDownloadEventClients} className="border-white/10 hover:bg-white/5">
                                  <Download className="mr-2 h-4 w-4" />
                                  Exporter cette liste
                              </Button>
                          </div>
                          <div className="border border-white/10 rounded-lg overflow-hidden">
                              <Table>
                                  <TableHeader className="bg-white/5">
                                      <TableRow className="border-white/5">
                                          <TableHead>Nom</TableHead>
                                          <TableHead>Email</TableHead>
                                          <TableHead>Type Billet</TableHead>
                                          <TableHead className="text-right">Prix Payé</TableHead>
                                          <TableHead className="text-right">Date Achat</TableHead>
                                      </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                      {eventClients.length > 0 ? (
                                          eventClients.map((client) => (
                                              <TableRow key={client.id} className="border-white/5 hover:bg-white/5">
                                                  <TableCell className="font-medium">{client.name}</TableCell>
                                                  <TableCell className="text-muted-foreground">{client.email}</TableCell>
                                                  <TableCell><Badge variant="secondary" className="bg-white/10">{client.ticketType}</Badge></TableCell>
                                                  <TableCell className="text-right">{client.price} TND</TableCell>
                                                  <TableCell className="text-right text-xs text-muted-foreground">
                                                      {new Date(client.purchaseDate).toLocaleDateString()}
                                                  </TableCell>
                                              </TableRow>
                                          ))
                                      ) : (
                                          <TableRow>
                                              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                  Aucune vente pour le moment.
                                              </TableCell>
                                          </TableRow>
                                      )}
                                  </TableBody>
                              </Table>
                          </div>
                      </div>
                  </div>
              )}
          </DialogContent>
      </Dialog>
    </div>
  );
}
