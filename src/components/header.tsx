"use client";

import Link from 'next/link';
import { Menu, Ticket, User, LogOut, Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { createClient } from '@/lib/supabase/client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Logo } from './logo';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useToast } from '@/hooks/use-toast';

const navLinks = [
  { href: '/etoile', label: 'Eventi ESS' },
  { href: '/', label: 'Événements' },
  { href: '/profile', label: 'Mes Billets' },
];

export function Header() {
  const pathname = usePathname();
  const { user, loading } = useUser();
  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();

  // Add Dashboard link conditionally based on role
  const dashboardLink = user && (user.role === 'admin' || user.role === 'super_admin' || user.role === 'gate_personnel') 
    ? { href: user.role === 'super_admin' ? '/super-admin' : user.role === 'admin' ? '/admin' : '/gate', label: user.role === 'gate_personnel' ? 'Porte' : 'Dashboard' }
    : null;

  const currentNavLinks = dashboardLink ? [dashboardLink, ...navLinks] : navLinks;

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({ title: 'Déconnexion réussie.' });
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur lors de la déconnexion',
        description: error.message,
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
      <div className="container flex h-16 items-center">
        <div className="mr-8 flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-1.5 rounded-lg bg-gradient-primary group-hover:scale-110 transition-transform duration-300">
              <Logo className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-headline text-gradient text-lg">Eventi</span>
              {user && (user.role === 'admin' || user.role === 'super_admin') && (
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold -mt-1">
                  {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                </span>
              )}
            </div>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
          {currentNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'relative px-3.5 py-2 rounded-lg transition-all duration-300',
                pathname === link.href
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              )}
            >
              {link.label}
              {pathname === link.href && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-white/10 hover:ring-white/20 transition-all">
                  <Avatar className="h-9 w-9">
                    {user.photoURL ? (
                       <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />
                    ) : (
                      <AvatarFallback className="bg-slate-200 text-slate-500 flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 glass-strong">
                <DropdownMenuLabel className="text-foreground">{user.displayName || user.email}</DropdownMenuLabel>
                {user.role === 'super_admin' && (
                  <>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-white/10 text-primary font-medium">
                      <Link href="/super-admin">Super Admin</Link>
                    </DropdownMenuItem>
                  </>
                )}
                {user.role === 'admin' && (
                  <>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-white/10 text-primary font-medium">
                      <Link href="/admin">Dashboard Admin</Link>
                    </DropdownMenuItem>
                  </>
                )}
                {user.role === 'gate' && (
                  <>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-white/10 text-primary font-medium">
                      <Link href="/gate">Portail Gate</Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-white/10">
                  <Link href="/profile">Profil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-white/10">
                  <Link href="/profile">Mes Billets</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer hover:bg-destructive/20 text-red-400">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                <Link href="/login">Se connecter</Link>
              </Button>
              <Button size="sm" asChild className="bg-gradient-primary hover:opacity-90 transition-opacity border-0 shadow-glow-sm">
                <Link href="/signup">S&apos;inscrire</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden hover:bg-white/10">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Ouvrir le menu de navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="glass-strong border-r border-white/10">
              <nav className="grid gap-4 text-lg font-medium mt-8">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <Logo className="h-6 w-6 text-primary" />
                  <span className="font-headline text-gradient">Eventi</span>
                </Link>
                {currentNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'px-3 py-2 rounded-lg transition-all duration-300',
                      pathname === link.href
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                {!user && (
                  <div className="flex flex-col gap-2 mt-4 border-t border-white/10 pt-6">
                    <Button variant="ghost" asChild>
                      <Link href="/login">Se connecter</Link>
                    </Button>
                    <Button asChild className="bg-gradient-primary border-0">
                      <Link href="/signup">S&apos;inscrire</Link>
                    </Button>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
