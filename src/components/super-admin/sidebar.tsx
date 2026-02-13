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
import { LayoutDashboard, BarChart3, Ticket, Percent, Settings, LogOut, User } from 'lucide-react';
import { Logo } from '../logo';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useUser } from '@/hooks/use-user';

const navItems = [
  { href: '/super-admin', label: 'Aperçu', icon: LayoutDashboard },
  { href: '/super-admin/reports', label: 'Rapports Financiers', icon: BarChart3 },
  { href: '/super-admin/events', label: 'Configuration Événements', icon: Ticket },
  { href: '/super-admin/commissions', label: 'Commissions', icon: Percent },
];

export function SuperAdminSidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <Sidebar className="border-r border-white/5 bg-sidebar">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Logo className="w-7 h-7 text-primary" />
          <span className="font-semibold text-lg font-headline text-gradient">Super Admin</span>
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
            <SidebarMenuButton icon={<Settings />}>
              Paramètres
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/" passHref>
              <SidebarMenuButton icon={<LogOut />}>
                Déconnexion
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
        {user && (
          <div className='flex items-center gap-2 p-2 border-t border-white/5'>
            <Avatar className="w-10 h-10 border border-white/10">
              {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || ''} />}
              <AvatarFallback className="bg-slate-200 text-slate-600 flex items-center justify-center">
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
