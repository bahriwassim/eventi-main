'use client';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { categories, events } from "@/lib/placeholder-data";
import { PlusCircle, Save, Trash2 } from "lucide-react";
import { useState } from "react";

export default function SuperAdminEventsPage() {
  const [featuredEvents, setFeaturedEvents] = useState(['1', '9', '7', '10']);
  const [currentCategories, setCategories] = useState(categories);
  const [newCategory, setNewCategory] = useState('');

  const toggleFeatured = (eventId: string) => {
    setFeaturedEvents(prev =>
      prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
    );
  };

  const addCategory = () => {
    if (newCategory && !currentCategories.includes(newCategory)) {
      setCategories([...currentCategories, newCategory]);
      setNewCategory('');
    }
  }

  const removeCategory = (categoryToRemove: string) => {
    setCategories(currentCategories.filter(cat => cat !== categoryToRemove));
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold font-headline mb-2 text-foreground">Configuration Globale</h1>
        <p className="text-muted-foreground">
          Gérez les paramètres globaux pour les événements et la plateforme.
        </p>
      </div>

      <Card className="border-white/5 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Frais de Service</CardTitle>
          <CardDescription>Définissez les frais de traitement appliqués à toutes les transactions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fee-percentage" className="text-muted-foreground">Frais en Pourcentage (%)</Label>
              <Input id="fee-percentage" type="number" defaultValue="7" className="bg-white/5 border-white/10 focus:border-primary/50 transition-all" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fee-fixed" className="text-muted-foreground">Frais Fixes (TND)</Label>
              <Input id="fee-fixed" type="number" defaultValue="0.500" className="bg-white/5 border-white/10 focus:border-primary/50 transition-all" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="bg-gradient-primary hover:opacity-90 transition-opacity border-0 shadow-glow-sm"><Save className="mr-2 h-4 w-4" /> Sauvegarder les Frais</Button>
        </CardFooter>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="border-white/5 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-foreground">Événements à la Une</CardTitle>
            <CardDescription>Sélectionnez les événements à afficher sur la page d&apos;accueil.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {events.slice(0, 6).map(event => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                  <span className="font-medium truncate pr-4 text-foreground">{event.name}</span>
                  <Switch
                    checked={featuredEvents.includes(event.id)}
                    onCheckedChange={() => toggleFeatured(event.id)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-foreground">Catégories d&apos;Événements</CardTitle>
            <CardDescription>Gérez les catégories disponibles pour les événements.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {currentCategories.map(cat => (
                <div key={cat} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <span className="text-foreground">{cat}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors" onClick={() => removeCategory(cat)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Input
              placeholder="Nouvelle catégorie..."
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="bg-white/5 border-white/10 focus:border-primary/50 transition-all"
            />
            <Button onClick={addCategory} className="bg-gradient-primary hover:opacity-90 transition-opacity border-0"><PlusCircle className="mr-2 h-4 w-4" /> Ajouter</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
