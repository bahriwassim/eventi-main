'use client';

import * as React from 'react';
import { EventCard } from '@/components/event-card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { type Event } from '@/lib/placeholder-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Autoplay from 'embla-carousel-autoplay';

interface EventsCarouselProps {
  events: Event[];
  title?: string;
}

export function EventsCarousel({ events, title }: EventsCarouselProps) {
  const imageMap = new Map(PlaceHolderImages.map((img) => [img.id, img]));

  // Plugin for autoplay
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  if (!events || events.length === 0) return null;

  return (
    <div className="w-full py-8">
      {title && (
        <div className="flex items-center gap-3 mb-6 px-1">
          <div className="h-6 w-1 rounded-full bg-primary" />
          <h2 className="text-2xl font-bold font-headline text-foreground">{title}</h2>
        </div>
      )}
      
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent className="-ml-4 pb-4">
          {events.map((event) => {
            const image = imageMap.get(event.image);
            return (
              <CarouselItem key={event.id} className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <div className="h-full transform transition-all duration-300 hover:-translate-y-1">
                  <EventCard event={event} image={image} />
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <div className="hidden md:block">
          <CarouselPrevious className="left-[-1rem] bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10 hover:text-primary" />
          <CarouselNext className="right-[-1rem] bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10 hover:text-primary" />
        </div>
      </Carousel>
    </div>
  );
}
