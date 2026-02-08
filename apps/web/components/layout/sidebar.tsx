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
  MessageSquare,
} from 'lucide-react';

interface SidebarProps {
  role?: string;
}

export function Sidebar({ role = 'end_user' }: SidebarProps) {
  const pathname = usePathname();

  const navigation = getNavigationForRole(role);

  return (
    <aside className="w-64 border-r bg-background h-[calc(100vh-4rem)] sticky top-16">
      <nav className="flex flex-col gap-2 p-4">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent',
              pathname === item.href ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
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
  const commonLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/tickets', label: 'My Tickets', icon: Ticket },
    { href: '/kb', label: 'Knowledge Base', icon: BookOpen },
  ];

  if (role === 'agent' || role === 'manager') {
    return [
      { href: '/agent', label: 'Agent Dashboard', icon: Home },
      { href: '/agent/tickets', label: 'All Tickets', icon: Ticket },
      { href: '/kb', label: 'Knowledge Base', icon: BookOpen },
    ];
  }

  if (role === 'admin') {
    return [
      { href: '/admin', label: 'Admin Dashboard', icon: Home },
      { href: '/admin/users', label: 'Users', icon: Users },
      { href: '/admin/reports', label: 'Reports', icon: BarChart },
      { href: '/admin/settings', label: 'Settings', icon: Settings },
      { href: '/kb', label: 'Knowledge Base', icon: BookOpen },
    ];
  }

  return commonLinks;
}
