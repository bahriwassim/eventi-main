'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { EventCard } from '@/components/event-card';
import { EventFilters } from '@/components/event-filters';
import { events } from '@/lib/placeholder-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { EventsCarousel } from '@/components/events-carousel';
import { EventCardSkeleton } from '@/components/event-card-skeleton';
import { Sparkles, Calendar, Users, Ticket, ArrowDown } from 'lucide-react';

function FilteredEventList({ events, imageMap }: { events: any[], imageMap: any }) {
  const searchParams = useSearchParams();
  const query = searchParams.get('q')?.toLowerCase() || '';
  const category = searchParams.get('category') || 'all';
  const location = searchParams.get('location') || 'all';

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(query) || 
                          event.description.toLowerCase().includes(query) ||
                          event.location.toLowerCase().includes(query);
    const matchesCategory = category === 'all' || event.category === category;
    const matchesLocation = location === 'all' || event.location.includes(location);

    return matchesSearch && matchesCategory && matchesLocation;
  });

  if (filteredEvents.length === 0) {
      return (
          <div className="col-span-full text-center py-12 glass rounded-xl border-white/5">
              <p className="text-xl text-muted-foreground">Aucun événement ne correspond à vos critères.</p>
              <p className="text-sm text-muted-foreground mt-2">Essayez de modifier vos filtres.</p>
          </div>
      );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEvents.map((event, index) => {
            const image = imageMap.get(event.image);
            return (
            <div
                key={event.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 80}ms` }}
            >
                <EventCard event={event} image={image} />
            </div>
            );
        })}
    </div>
  );
}

export default function Home() {
  const imageMap = new Map(PlaceHolderImages.map((img) => [img.id, img]));
  const [isLoading, setIsLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(() => {
        setScrollY(window.scrollY);
      });
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timer);
    };
  }, []);

  // Filter events for different sections
  const featuredEvents = events.slice(0, 5); // Just an example subset
  const upcomingEvents = events.filter(e => new Date(e.date) > new Date());

  return (
    <div className="relative overflow-x-hidden">
      {/* Background gradient orbs - Updated for light theme */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] animate-float opacity-60" 
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-fuchsia-500/20 rounded-full blur-[100px] animate-float opacity-60" 
          style={{ animationDelay: '2s', transform: `translateY(${-scrollY * 0.1}px)` }} 
        />
        <div 
          className="absolute top-1/2 left-1/2 w-72 h-72 bg-blue-500/15 rounded-full blur-[100px] animate-float opacity-60" 
          style={{ animationDelay: '4s', transform: `translateY(${scrollY * 0.15}px)` }} 
        />
      </div>

      <div className="container mx-auto px-4 py-6 md:py-12 perspective-1000">
        {/* Hero Section with Enhanced Parallax */}
        <section 
          className="relative text-center py-12 md:py-20 mb-10 overflow-visible transition-transform duration-100 ease-out"
          style={{ 
            transform: `translateY(${scrollY * 0.05}px) scale(${1 - scrollY * 0.0005})`,
            opacity: Math.max(0, 1 - scrollY * 0.0015) 
          }}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-animation z-0 opacity-0" />
          
          <div className="relative z-10 px-4">
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/80 border border-primary/20 text-primary text-sm font-semibold mb-4 animate-fade-in-up shadow-lg backdrop-blur-md hover:scale-105 transition-transform duration-300 ring-4 ring-white/30">
              <Sparkles className="h-4 w-4 animate-pulse" />
              Découvrez les événements à Sousse
            </div>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tight font-headline animate-fade-in-up drop-shadow-sm leading-tight mb-4" style={{ animationDelay: '100ms' }}>
              <span className="text-foreground relative inline-block hover:scale-105 transition-transform duration-500 hover:text-primary/90 cursor-default">Trouvez Votre</span>
              <br />
              <span className="text-gradient relative inline-block hover:scale-105 transition-transform duration-500 cursor-default filter drop-shadow-sm">Prochaine Expérience</span>
            </h1>
            <p className="mt-4 text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto animate-fade-in-up font-medium leading-relaxed" style={{ animationDelay: '200ms' }}>
              Parcourez et découvrez des événements passionnants. <span className="text-primary font-bold underline decoration-primary/30 decoration-4 underline-offset-4 hover:decoration-primary transition-all cursor-pointer">Musique</span>, <span className="text-fuchsia-600 font-bold underline decoration-fuchsia-600/30 decoration-4 underline-offset-4 hover:decoration-fuchsia-600 transition-all cursor-pointer">Sport</span>, <span className="text-blue-600 font-bold underline decoration-blue-600/30 decoration-4 underline-offset-4 hover:decoration-blue-600 transition-all cursor-pointer">Culture</span> et bien plus encore.
            </p>
            
            <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <ArrowDown className="mx-auto h-10 w-10 text-primary animate-bounce cursor-pointer hover:scale-125 transition-transform duration-300 hover:text-fuchsia-600" />
            </div>
          </div>
        </section>

        {/* Featured Events Carousel */}
        <div className="mb-16 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <EventsCarousel events={featuredEvents} title="🔥 À la une" />
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          {[
            { icon: Calendar, label: 'Événements', value: `${events.length}+` },
            { icon: Users, label: 'Participants', value: '5K+' },
            { icon: Ticket, label: 'Billets vendus', value: '12K+' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-6 rounded-2xl glass border-white/20 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-white/50">
              <div className="p-3 rounded-full bg-primary/10 text-primary mb-2">
                <stat.icon className="h-6 w-6" />
              </div>
              <span className="text-3xl font-bold font-headline text-foreground">{stat.value}</span>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="sticky top-20 z-30 bg-background/80 backdrop-blur-lg py-4 -mx-4 px-4 md:mx-0 md:px-0 md:rounded-xl mb-8 transition-all duration-300">
          <Suspense fallback={<div>Chargement des filtres...</div>}>
            <EventFilters />
          </Suspense>
        </div>

        {/* Section title */}
        <div id="events" className="flex items-center gap-4 mb-10 pt-24 -mt-24">
          <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
          <h2 className="text-2xl font-bold font-headline text-foreground">Tous les événements</h2>
          <div className="h-px flex-1 bg-gradient-to-l from-primary/30 to-transparent" />
        </div>

        {/* Event Grid */}
        {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                    <EventCardSkeleton key={index} />
                ))}
            </div>
        ) : (
            <Suspense fallback={
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <EventCardSkeleton key={index} />
                    ))}
                </div>
            }>
                <FilteredEventList events={events} imageMap={imageMap} />
            </Suspense>
        )}
      </div>
    </div>
  );
}
