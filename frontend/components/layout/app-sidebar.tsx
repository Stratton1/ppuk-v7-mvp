'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/properties', label: 'Properties' },
  { href: '/search', label: 'Search' },
  { href: '/tasks', label: 'Tasks' },
  { href: '/invitations', label: 'Invitations' },
  { href: '/settings', label: 'Settings' },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r border-border bg-muted/30 md:flex md:flex-col">
      <div className="px-4 py-5">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight text-primary">
          Property Passport
        </Link>
      </div>
      <nav className="flex-1 px-2 pb-6">
        <ul className="space-y-1 text-sm font-medium">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 transition-colors',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
