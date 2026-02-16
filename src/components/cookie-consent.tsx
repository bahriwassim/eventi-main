'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Cookie } from 'lucide-react';
import Link from 'next/link';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show banner after a short delay
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-slide-up">
      <div className="container mx-auto max-w-4xl bg-background/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-4 md:p-6 flex flex-col md:flex-row items-center gap-4 md:gap-8">
        <div className="flex items-center gap-4 flex-1">
          <div className="p-3 bg-primary/10 rounded-full flex-shrink-0">
            <Cookie className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground">Nous utilisons des cookies</h3>
            <p className="text-sm text-muted-foreground">
              Nous utilisons des cookies pour améliorer votre expérience. En continuant à visiter ce site, vous acceptez notre utilisation des cookies.
              <Link href="/privacy-policy" className="text-primary hover:underline ml-1">
                En savoir plus
              </Link>
            </p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none border-white/10 hover:bg-white/5" onClick={() => setShowBanner(false)}>
            Refuser
          </Button>
          <Button className="flex-1 md:flex-none bg-gradient-primary hover:opacity-90 border-0" onClick={acceptCookies}>
            Accepter
          </Button>
        </div>
      </div>
    </div>
  );
}
