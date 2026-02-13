'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { LayoutDashboard, Ticket, BarChart, Settings, LogOut, User, Wallet } from 'lucide-react';
import { Logo } from '../logo';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useUser } from '@/hooks/use-user';

const navItems = [
  { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin/events', label: 'Événements', icon: Ticket },
  { href: '/admin/sales', label: 'Données de vente', icon: BarChart },
  { href: '/admin/accounting', label: 'Comptabilité', icon: Wallet },
];

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

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
    <Sidebar className="border-r border-white/5 bg-sidebar">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Logo className="w-7 h-7 text-primary" />
          <span className="font-semibold text-lg font-headline text-gradient">Panneau Admin</span>
          <div className="ml-auto">
            <SidebarTrigger />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  icon={<item.icon />}
                >
                  {item.label}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/admin/settings" passHref>
              <SidebarMenuButton icon={<Settings />} isActive={pathname === '/admin/settings'}>
                Paramètres
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton icon={<LogOut />} onClick={handleLogout}>
              Déconnexion
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {user && (
          <div className='flex items-center gap-2 p-2 border-t border-white/5'>
            <Avatar className="w-10 h-10 border border-white/10">
              {user.photoURL ? <AvatarImage src={user.photoURL} alt={user.displayName || ''} /> : null}
              <AvatarFallback className="bg-slate-200 text-slate-500 flex items-center justify-center">
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div className='overflow-hidden'>
              <p className='font-semibold truncate text-foreground'>{user.displayName || user.email}</p>
              <p className='text-xs text-muted-foreground truncate'>{user.email}</p>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
