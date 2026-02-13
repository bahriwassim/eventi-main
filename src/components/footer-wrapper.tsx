'use client';

import { usePathname } from 'next/navigation';
import { Footer } from '@/components/footer';

export function FooterWrapper() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin') || pathname?.startsWith('/super-admin');

  if (isAdmin) {
    return null;
  }

  return <Footer />;
}
