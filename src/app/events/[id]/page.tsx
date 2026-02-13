'use client';

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useState } from 'react';
import { Calendar, MapPin, Ticket, Share2, Clock, ArrowLeft, Plus, Minus } from 'lucide-react';

import { events } from '@/lib/placeholder-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';

type EventPageProps = {
  params: { id: string };
};

export default function EventPage({ params }: EventPageProps) {
  const event = events.find((e) => e.id === params.id);
  if (!event) {
    notFound();
  }

  const ticketOptions = {
    gradin: { label: 'Gradin', price: event.price },
    chinois: { label: 'Chinois', price: event.price > 10 ? event.price - 10 : 10 },
    tribune: { label: 'Tribune', price: event.price + 20 },
  };

  const [selectedOption, setSelectedOption] = useState('gradin');
  const [currentPrice, setCurrentPrice] = useState(ticketOptions.gradin.price);
  const [quantity, setQuantity] = useState(1);

  const handleOptionChange = (value: string) => {
    if (value === 'gradin' || value === 'chinois' || value === 'tribune') {
      setSelectedOption(value);
      setCurrentPrice(ticketOptions[value as keyof typeof ticketOptions].price);
    }
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  const image = PlaceHolderImages.find((img) => img.id === event.image);

  return (
    <div className="relative">
      {/* Background effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-purple-500/8 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6 group">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Retour aux événements
        </Link>

        <div className="rounded-2xl overflow-hidden border border-white/5 bg-card/30 backdrop-blur-sm animate-fade-in-up">
          {/* Hero image */}
          <div className="relative h-72 md:h-[420px] w-full overflow-hidden">
            {image && (
              <Image
                src={image.imageUrl}
                alt={event.name}
                fill
                className="object-cover"
                data-ai-hint={image.imageHint}
                priority
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 z-10">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/80 border border-primary/30 text-white backdrop-blur-md mb-3 inline-block shadow-lg">
                {event.category}
              </span>
              <h1 className="text-3xl md:text-5xl font-bold text-white font-headline mt-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {event.name}
              </h1>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 grid md:grid-cols-3 gap-8">
            {/* Left - Description */}
            <div className="md:col-span-2 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <h2 className="text-xl font-semibold mb-4 font-headline text-foreground">À propos de cet événement</h2>
              <p className="text-muted-foreground leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* Right - Booking */}
            <div className="space-y-5 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                <Calendar className="h-6 w-6 text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm text-foreground">Date et Heure</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(event.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <div className="flex items-center text-muted-foreground text-xs mt-1">
                    <Clock className="mr-1.5 h-3.5 w-3.5" />
                    {event.time}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                <MapPin className="h-6 w-6 text-fuchsia-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm text-foreground">Lieu</h3>
                  <p className="text-sm text-muted-foreground">{event.location}</p>
                </div>
              </div>

              <Separator className="bg-white/10" />

              {event.category === 'Football' && (
                <div>
                  <h3 className="font-semibold text-sm mb-3 text-foreground">Choisissez votre place</h3>
                  <RadioGroup defaultValue={selectedOption} onValueChange={handleOptionChange} className="grid grid-cols-3 gap-2">
                    {Object.entries(ticketOptions).map(([key, { label, price }]) => (
                      <div key={key}>
                        <RadioGroupItem value={key} id={key} className="peer sr-only" />
                        <Label
                          htmlFor={key}
                          className={cn(
                            "flex flex-col items-center justify-center text-center rounded-xl border border-white/10 bg-white/5 p-3 text-xs font-medium hover:bg-white/10 cursor-pointer transition-all duration-300",
                            "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary"
                          )}
                        >
                          {label}
                          <span className="font-bold mt-1 text-sm">{price.toFixed(2)} TND</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              <div className="space-y-3">
                <Label className="text-sm text-foreground font-semibold">Quantité</Label>
                <div className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-xl p-2 w-fit">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 hover:bg-white/10 text-foreground"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-bold w-8 text-center text-foreground font-headline">{quantity}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 hover:bg-white/10 text-foreground"
                    onClick={() => handleQuantityChange(1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <div className="text-center py-3 rounded-xl bg-gradient-to-r from-purple-500/10 via-fuchsia-500/10 to-blue-500/10 border border-white/5">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-sm text-muted-foreground mb-1">Total</span>
                    <span className="text-3xl font-bold text-gradient font-headline">
                      {(currentPrice * quantity).toFixed(2)} TND
                    </span>
                  </div>
                </div>
                <Button size="lg" className="w-full bg-gradient-primary hover:opacity-90 transition-opacity border-0 shadow-glow-sm" asChild>
                  <Link href={`/checkout/${event.id}?type=${selectedOption}&price=${currentPrice}&quantity=${quantity}`}>
                    <Ticket className="mr-2 h-5 w-5" />
                    Acheter {quantity > 1 ? 'des Billets' : 'un Billet'}
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full border-white/10 bg-white/5 hover:bg-white/10 transition-all">
                  <Share2 className="mr-2 h-5 w-5" />
                  Partager
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
