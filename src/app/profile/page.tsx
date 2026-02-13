'use client';

import Image from 'next/image';
import { users, events } from '@/lib/placeholder-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { FileText, MapPin, Calendar, Edit, Loader2, Ticket, User, Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');
  const eventImageMap = new Map(PlaceHolderImages.map((img) => [img.id, img]));
  const eventMap = new Map(events.map((evt) => [evt.id, evt]));

  const { user, loading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (user) {
      setProfileData({
        displayName: user.displayName || '',
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
        address: user.user_metadata?.address || ''
      });
    }
  }, [user, loading, router]);

  const handleUpdateProfile = async () => {
    try {
        const { error } = await supabase.auth.updateUser({
            data: { 
                display_name: profileData.displayName,
                phone: profileData.phone,
                address: profileData.address
            }
        });

        if (error) throw error;

        toast({ title: "Profil mis à jour", description: "Vos informations ont été modifiées avec succès." });
        setIsEditProfileOpen(false);
        window.location.reload(); 
    } catch (error: any) {
        toast({ variant: "destructive", title: "Erreur", description: error.message });
    }
  };

  const demoUser = user ? users.find(u => u.email === user.email) : null;
  const purchasedTickets = demoUser ? demoUser.purchasedTickets : [];

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-purple-500/8 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Profile card */}
          <div className="md:col-span-1 animate-fade-in-up">
            <div className="rounded-2xl glass border-white/5 p-6 text-center">
              <div className="relative inline-block mb-4">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full opacity-60 blur-sm" />
                <Avatar className="w-24 h-24 relative ring-4 ring-background shadow-xl">
                  {user.photoURL ? <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} /> : (userAvatar && <AvatarImage src={userAvatar.imageUrl} alt={user.displayName || 'User'} />)}
                  <AvatarFallback className="bg-slate-200 text-slate-500 flex items-center justify-center">
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
              </div>
              <h2 className="text-xl font-bold font-headline text-foreground">{user.displayName || 'Utilisateur'}</h2>
              <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
              
              <div className="mt-6 space-y-3 text-left">
                  {user.user_metadata?.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4 text-primary" />
                          <span>{user.user_metadata.phone}</span>
                      </div>
                  )}
                  {user.user_metadata?.address && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>{user.user_metadata.address}</span>
                      </div>
                  )}
              </div>

              <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full mt-6 border-white/10 bg-white/5 hover:bg-white/10 transition-all">
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier le profil
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-strong border-white/10">
                  <DialogHeader>
                    <DialogTitle>Modifier le profil</DialogTitle>
                    <DialogDescription>Mettez à jour vos informations personnelles.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="displayName">Nom d&apos;affichage</Label>
                      <Input 
                        id="displayName" 
                        value={profileData.displayName} 
                        onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input 
                        id="phone" 
                        value={profileData.phone} 
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        placeholder="+216 00 000 000"
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="address">Adresse</Label>
                      <Input 
                        id="address" 
                        value={profileData.address} 
                        onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                        placeholder="Votre adresse"
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        value={profileData.email} 
                        disabled
                        className="bg-white/5 border-white/10 opacity-50"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleUpdateProfile} className="bg-gradient-primary">Sauvegarder</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Tickets */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Ticket className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold font-headline text-foreground">Mes Billets</h2>
            </div>
            {purchasedTickets.length > 0 ? (
              <div className="space-y-4">
                {purchasedTickets.map((ticket, index) => {
                  const event = eventMap.get(ticket.eventId);
                  const eventImage = event ? eventImageMap.get(event.image) : undefined;
                  if (!event) return null;

                  return (
                    <div key={ticket.ticketId} className="rounded-xl overflow-hidden border border-white/5 bg-card/30 backdrop-blur-sm hover:border-purple-500/20 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="flex flex-col sm:flex-row">
                        {eventImage && (
                          <div className="relative h-40 sm:h-auto sm:w-40 flex-shrink-0 overflow-hidden">
                            <Image
                              src={eventImage.imageUrl}
                              alt={event.name}
                              fill
                              className="object-cover"
                              data-ai-hint={eventImage.imageHint}
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/80 hidden sm:block" />
                          </div>
                        )}
                        <div className="flex flex-col flex-grow p-4">
                          <h3 className="font-bold text-foreground font-headline">{event.name}</h3>
                          <div className="flex items-center text-xs text-muted-foreground mt-1.5">
                            <FileText className="h-3.5 w-3.5 mr-1.5 text-primary" />
                            ID: {ticket.ticketId}
                          </div>
                          <div className="flex flex-wrap gap-3 mt-2">
                            <span className="flex items-center text-xs text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5 mr-1 text-purple-400" />
                              {new Date(event.date).toLocaleDateString('fr-FR', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="flex items-center text-xs text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5 mr-1 text-fuchsia-400" />
                              {event.location}
                            </span>
                          </div>
                          <div className="mt-3">
                            <Button asChild size="sm" className="bg-gradient-primary hover:opacity-90 transition-opacity border-0 text-xs">
                              <Link href={`/confirmation/${event.id}`}>Voir Billet & Code QR</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl glass border-white/5 p-12 text-center animate-fade-in-up">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Ticket className="h-8 w-8 text-primary animate-bounce-subtle" />
                </div>
                <h3 className="text-lg font-bold font-headline text-foreground">Aucun Billet Pour L&apos;instant</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                  Vous n&apos;avez acheté aucun billet. Pour voir un exemple, créez un compte avec l&apos;e-mail <code className="bg-white/10 px-1.5 py-0.5 rounded text-primary text-xs">user@eventi.com</code>.
                </p>
                <Button asChild className="mt-6 bg-gradient-primary hover:opacity-90 transition-opacity border-0 shadow-glow-sm">
                  <Link href="/">Parcourir les événements</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
