import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import EventDetails from './event-details';
import { getIdFromSlug, slugify } from '@/lib/slug';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ id: string }>;
};

// SEO Metadata Generation
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: rawId } = await params;
  const id = getIdFromSlug(rawId);
  const supabase = await createClient();
  
  // Try DB only - no more placeholder fallback
  const { data: event } = await supabase.from('events').select('*').eq('id', id).single();

  if (!event) {
    return {
      title: 'Événement non trouvé | Eventi',
    };
  }

  return {
    title: `${event.name} | Billets & Infos | Eventi`,
    description: event.description ? event.description.substring(0, 160) : `Achetez vos billets pour ${event.name} à ${event.location}.`,
    openGraph: {
      title: event.name,
      description: event.description,
      images: event.image_url ? [event.image_url] : [],
    },
  };
}

// This is a Server Component
export default async function EventPage({ params }: Props) {
  const { id: rawId } = await params;
  const supabase = await createClient();
  const id = getIdFromSlug(rawId);
  
  // Try to fetch from DB first
  const { data: event } = await supabase
    .from('events')
    .select(`
        *,
        ticket_types (*)
    `)
    .eq('id', id)
    .single();

  if (!event) {
    notFound();
  }

  // Canonical redirect for DB events
  const correctSlug = slugify(event.name, event.id);
  // Check if we are already on the correct slug (avoid redirect loop if matching)
  // Note: params.id is URL encoded, so we decode it just in case
  if (decodeURIComponent(rawId) !== correctSlug) {
     // Only redirect if the ID part is correct but the name part is missing or different
     // This forces the "pretty" URL
     // redirect(`/events/${correctSlug}`);
     // Commented out to avoid potential loop/issues during dev, but recommended for Prod.
  }

  return <EventDetails event={event} isPlaceholder={false} />;
}
