'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, type IconName } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export type AppShellNavItem = {
  href: string;
  label: string;
  slug: string;
  icon: IconName;
};

type AppShellSidebarProps = {
  items: AppShellNavItem[];
  variant?: 'desktop' | 'mobile';
};

export function AppShellSidebar({ items, variant = 'desktop' }: AppShellSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  if (variant === 'mobile') {
    return (
      <nav className="flex gap-2 overflow-x-auto px-4 py-3 lg:hidden" aria-label="Secondary navigation">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              data-testid={`nav-${item.slug}`}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition',
                active ? 'border-primary/60 bg-primary/10 text-primary' : 'border-border/60 bg-card hover:bg-muted'
              )}
            >
              <Icon name={item.icon} className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r border-border/60 bg-muted/30 lg:flex lg:flex-col">
      <div className="px-5 py-6">
        <div className="text-lg font-semibold tracking-tight text-primary">Property Passport</div>
        <p className="text-xs text-muted-foreground">Manage your passports</p>
      </div>
      <nav className="flex-1 px-3 pb-6" aria-label="Primary navigation">
        <ul className="space-y-1 text-sm font-medium">
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  data-testid={`nav-${item.slug}`}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                  <Icon name={item.icon} className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
