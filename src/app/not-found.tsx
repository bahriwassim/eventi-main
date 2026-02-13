import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Ghost } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center px-4">
      {/* Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="animate-float mb-6">
        <Ghost className="w-20 h-20 text-primary/60" />
      </div>
      <h1 className="text-8xl font-bold font-headline text-gradient mb-2">404</h1>
      <h2 className="text-2xl font-semibold mt-2 mb-3 text-foreground font-headline">Page non trouvée</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        Désolé, la page que vous recherchez n&apos;existe pas ou a été déplacée.
      </p>
      <Button asChild className="bg-gradient-primary hover:opacity-90 transition-opacity border-0 shadow-glow-sm">
        <Link href="/">Retour à l&apos;accueil</Link>
      </Button>
    </div>
  );
}
