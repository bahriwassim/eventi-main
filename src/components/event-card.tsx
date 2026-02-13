import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin } from 'lucide-react';

import type { Event } from '@/lib/placeholder-data';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type EventCardProps = {
  event: Event;
  image?: ImagePlaceholder;
};

export function EventCard({ event, image }: EventCardProps) {
  return (
    <Card className="group flex flex-col overflow-hidden transition-all duration-500 hover:shadow-glow-sm border-white/5 hover:border-purple-500/20 bg-card/50 backdrop-blur-sm hover:-translate-y-2">
      <Link href={`/events/${event.id}`} className="flex flex-col h-full">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full overflow-hidden">
            {image && (
              <Image
                src={image.imageUrl}
                alt={event.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                data-ai-hint={image.imageHint}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            )}
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

            {/* Category badge */}
            <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium bg-black/40 backdrop-blur-md border border-white/20 text-white shadow-sm">
              {event.category}
            </span>

            {/* Price overlay */}
            <div className="absolute bottom-3 left-3 z-10">
              <span className="px-3 py-1.5 rounded-lg text-sm font-bold bg-gradient-primary text-white shadow-lg border border-white/10">
                {event.price} TND
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-4 space-y-2">
          <CardTitle className="text-base font-bold leading-tight font-headline text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
            {event.name}
          </CardTitle>
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="mr-1.5 h-3.5 w-3.5 text-purple-400" />
            {new Date(event.date).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <MapPin className="mr-1.5 h-3.5 w-3.5 text-fuchsia-400" />
            {event.location}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <span className="text-xs font-medium text-primary group-hover:text-fuchsia-400 transition-colors duration-300 flex items-center gap-1">
            Voir les détails
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </span>
        </CardFooter>
      </Link>
    </Card>
  );
}
