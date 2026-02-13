'use client';

import { events } from '@/lib/placeholder-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { EventCard } from '@/components/event-card';
import { ArrowRight, Trophy, Users, Calendar, Star, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function EtoilePage() {
  const imageMap = new Map(PlaceHolderImages.map((img) => [img.id, img]));
  
  // Filter ESS events
  const essEvents = events.filter(e => 
    e.name.includes('Étoile') || e.name.includes('ESS') || e.description.includes('ESS')
  );

  // Group events by category
  const categories = ['Football', 'Volleyball', 'Basketball'];
  const groupedEvents = categories.map(category => ({
      name: category,
      events: essEvents.filter(e => e.category === category)
  })).filter(group => group.events.length > 0);

  return (
    <div className="min-h-screen bg-white text-black overflow-hidden relative">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 bg-white overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[120px] animate-pulse delay-1000" />
        
        {/* Subtle Watermarks - Increased visibility */}
        <Star className="absolute top-20 right-10 w-96 h-96 text-red-500/10 rotate-12" />
        <Trophy className="absolute bottom-20 left-10 w-[500px] h-[500px] text-red-500/10 -rotate-12" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge className="mb-6 bg-red-600 hover:bg-red-700 text-white border-none px-4 py-1 text-sm font-bold uppercase tracking-widest animate-fade-in-up">
            L'Étoile Sportive du Sahel
          </Badge>
          
          <h1 className="text-6xl md:text-8xl font-black font-headline mb-6 animate-fade-in-up delay-100">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-black to-gray-500">FIERTÉ DU</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-red-500 drop-shadow-[0_0_25px_rgba(220,38,38,0.2)]">
              SAHEL
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-200">
            Vivez la passion, la gloire et l'histoire. Rejoignez la légende rouge et blanche pour des moments inoubliables.
          </p>

          <div className="flex justify-center gap-4 animate-fade-in-up delay-300">
             <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 text-white border-0 shadow-lg transition-all hover:scale-105">
                <Link href="#matches">
                  Voir les Matchs <Flame className="ml-2 h-5 w-5" />
                </Link>
             </Button>
          </div>
        </div>

        {/* Decorative Star */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 opacity-5 animate-spin-slow">
            <Star className="w-[800px] h-[800px] text-red-600" />
        </div>
      </section>

      {/* Events Grid */}
      <section id="matches" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 space-y-20">
            {groupedEvents.length > 0 ? (
                groupedEvents.map((group) => (
                    <div key={group.name}>
                        <div className="flex items-center gap-4 mb-10">
                            <div className="h-8 w-1 bg-red-600 rounded-full" />
                            <h2 className="text-3xl md:text-4xl font-bold font-headline text-gray-900">{group.name}</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {group.events.map((event, index) => {
                                const image = imageMap.get(event.image);
                                return (
                                    <div
                                    key={event.id}
                                    className="animate-fade-in-up group"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                    <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:border-red-600/30 transition-all duration-300 hover:shadow-xl">
                                        {/* Custom Event Card Content specifically for ESS page */}
                                        <div className="aspect-[4/3] relative overflow-hidden">
                                            {/* We can use the existing EventCard or build a custom one. Let's use custom to make it very "ESS" themed */}
                                            {image ? (
                                                <img 
                                                    src={image.imageUrl} 
                                                    alt={event.name} 
                                                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-red-50 flex items-center justify-center">
                                                    <Star className="h-12 w-12 text-red-500/50" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                                            <div className="absolute top-3 right-3">
                                                <Badge className="bg-red-600 text-white border-none shadow-sm">{event.category}</Badge>
                                            </div>
                                        </div>
                                        
                                        <div className="p-5">
                                            <div className="flex items-center gap-2 text-red-600 text-xs font-semibold uppercase tracking-wider mb-2">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                            </div>
                                            <h3 className="text-xl font-bold font-headline mb-3 leading-tight text-gray-900 group-hover:text-red-600 transition-colors">
                                                {event.name}
                                            </h3>
                                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                                <span className="text-lg font-bold text-gray-900">{event.price} TND</span>
                                                <Button size="sm" asChild className="bg-red-600 text-white hover:bg-red-700 font-bold rounded-full shadow-md">
                                                    <Link href={`/events/${event.id}`}>Réserver</Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))
            ) : (
                <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-gray-200 shadow-sm">
                    <p className="text-2xl text-gray-400 font-headline">Aucun match programmé pour le moment</p>
                </div>
            )}
        </div>
      </section>
    </div>
  );
}
