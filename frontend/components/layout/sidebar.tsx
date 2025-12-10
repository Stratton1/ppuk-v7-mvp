import Link from 'next/link';
import { cn } from '@/lib/utils';

const links = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/properties', label: 'Properties' },
  { href: '/dashboard/documents', label: 'Documents' },
  { href: '/dashboard/settings', label: 'Settings' },
];

type SidebarProps = {
  className?: string;
};

export const Sidebar = ({ className }: SidebarProps) => {
  return (
    <aside className={cn('hidden w-64 flex-shrink-0 border-r bg-card md:block', className)}>
      <div className="px-4 py-6">
        <h2 className="mb-4 text-sm font-semibold text-muted-foreground">Navigation</h2>
        <ul className="space-y-2 text-sm">
          {links.map((link) => (
            <li key={link.href}>
              <Link className="block rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground" href={link.href}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};
