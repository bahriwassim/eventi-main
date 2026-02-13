'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import { Bell, Lock, Mail, User } from 'lucide-react';

export default function AdminSettingsPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    notifications: true,
    twoFactor: false
  });

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    toast({ title: "Paramètres sauvegardés", description: "Vos modifications ont été enregistrées avec succès." });
  };

  return (
    <div className="animate-fade-in-up space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline mb-2 text-foreground">Paramètres</h1>
        <p className="text-muted-foreground">
          Gérez vos préférences de compte et de sécurité.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="border-white/5 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Profil
            </CardTitle>
            <CardDescription>Vos informations personnelles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                value={formData.email} 
                disabled 
                className="bg-white/5 border-white/10 opacity-50"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-purple-400" />
              Notifications
            </CardTitle>
            <CardDescription>Gérez vos préférences de notification.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications par email</Label>
                <p className="text-xs text-muted-foreground">Recevoir des mises à jour sur vos événements</p>
              </div>
              <Switch 
                checked={formData.notifications}
                onCheckedChange={(c) => setFormData({...formData, notifications: c})}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-fuchsia-400" />
              Sécurité
            </CardTitle>
            <CardDescription>Sécurisez votre compte.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Double authentification</Label>
                <p className="text-xs text-muted-foreground">Ajouter une couche de sécurité supplémentaire</p>
              </div>
              <Switch 
                checked={formData.twoFactor}
                onCheckedChange={(c) => setFormData({...formData, twoFactor: c})}
              />
            </div>
            <Button variant="outline" className="w-full border-white/10">Changer le mot de passe</Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} className="bg-gradient-primary min-w-[150px]">
          {loading ? "Sauvegarde..." : "Sauvegarder"}
        </Button>
      </div>
    </div>
  );
}
