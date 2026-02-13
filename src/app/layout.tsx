import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/header';
import { FooterWrapper } from '@/components/footer-wrapper';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Evanti - Découvrez des Événements Extraordinaires',
  description: 'Votre portail premium pour découvrir, réserver et vivre les meilleurs événements à Sousse et dans la région du Sahel.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body
        className={cn(
          'min-h-screen font-body antialiased bg-background flex flex-col',
        )}
      >
        <Header />
        <main className="flex-1">{children}</main>
        {/* Render Footer only if not in admin layout. 
            However, checking route in layout is tricky (server component). 
            Better approach: Admin layout should just not include it, 
            BUT root layout wraps everything.
            Solution: Use a Client Component wrapper for Footer that checks usePathname
         */}
        <FooterWrapper />
        <Toaster />
      </body>
    </html>
  );
}
