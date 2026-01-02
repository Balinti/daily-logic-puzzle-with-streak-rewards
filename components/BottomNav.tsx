'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Calendar, TrendingUp, Archive, User } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/daily', label: 'Daily', icon: Calendar },
    { href: '/practice', label: 'Practice', icon: TrendingUp },
    { href: '/archive', label: 'Archive', icon: Archive },
    { href: '/account', label: 'Account', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t">
      <div className="container mx-auto px-2 py-2">
        <div className="flex items-center justify-around">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors text-xs',
                  isActive
                    ? 'text-primary font-semibold bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
