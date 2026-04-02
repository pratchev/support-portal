'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  Ticket,
  Users,
  BarChart,
  Settings,
  BookOpen,
  UserCircle,
} from 'lucide-react';

interface SidebarProps {
  role?: string;
}

export function Sidebar({ role = 'end_user' }: SidebarProps) {
  const pathname = usePathname();

  const navigation = getNavigationForRole(role);

  return (
    <aside className="w-64 border-r bg-background h-[calc(100vh-3.5rem)] sticky top-14">
      <nav className="flex flex-col gap-1 p-4">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-150',
              pathname === item.href ||
                (item.href !== '/' &&
                  item.href !== '/admin' &&
                  item.href !== '/agent' &&
                  item.href !== '/dashboard' &&
                  pathname.startsWith(item.href))
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

function getNavigationForRole(role: string) {
  const r = role?.toUpperCase();

  if (
    r === 'AGENT' ||
    r === 'MANAGER' ||
    role === 'agent' ||
    role === 'manager'
  ) {
    return [
      { href: '/agent', label: 'Agent Dashboard', icon: Home },
      { href: '/agent/tickets', label: 'All Tickets', icon: Ticket },
      { href: '/kb', label: 'Knowledge Base', icon: BookOpen },
      { href: '/dashboard/profile', label: 'Profile', icon: UserCircle },
    ];
  }

  if (r === 'ADMIN' || role === 'admin') {
    return [
      { href: '/admin', label: 'Admin Dashboard', icon: Home },
      { href: '/agent/tickets', label: 'All Tickets', icon: Ticket },
      { href: '/admin/users', label: 'Users', icon: Users },
      { href: '/admin/reports', label: 'Reports', icon: BarChart },
      { href: '/admin/settings', label: 'Settings', icon: Settings },
      { href: '/kb', label: 'Knowledge Base', icon: BookOpen },
    ];
  }

  return [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/tickets', label: 'My Tickets', icon: Ticket },
    { href: '/kb', label: 'Knowledge Base', icon: BookOpen },
    { href: '/dashboard/profile', label: 'Profile', icon: UserCircle },
  ];
}
