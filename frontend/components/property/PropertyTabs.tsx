'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Info,
  Image as ImageIcon,
  FileText,
  AlertTriangle,
  CheckSquare,
  History,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type PropertyTabsProps = {
  propertyId: string;
  allowedTabs?: string[];
};

const tabConfig = [
  { slug: 'overview', label: 'Overview', icon: LayoutDashboard },
  { slug: 'details', label: 'Details', icon: Info },
  { slug: 'media', label: 'Media', icon: ImageIcon },
  { slug: 'documents', label: 'Documents', icon: FileText },
  { slug: 'issues', label: 'Issues', icon: AlertTriangle },
  { slug: 'tasks', label: 'Tasks', icon: CheckSquare },
  { slug: 'history', label: 'History', icon: History },
] as const;

export function PropertyTabs({ propertyId, allowedTabs }: PropertyTabsProps) {
  const pathname = usePathname();
  const basePath = `/properties/${propertyId}`;

  const active = (() => {
    if (pathname?.includes('/details')) return 'details';
    if (pathname?.includes('/media')) return 'media';
    if (pathname?.includes('/documents')) return 'documents';
    if (pathname?.includes('/issues')) return 'issues';
    if (pathname?.includes('/tasks')) return 'tasks';
    if (pathname?.includes('/history')) return 'history';
    return 'overview';
  })();

  const tabs = tabConfig
    .filter((tab) => !allowedTabs || allowedTabs.includes(tab.slug))
    .map((tab) => ({
      ...tab,
      href: tab.slug === 'overview' ? basePath : tab.slug === 'tasks' ? `${basePath}#tasks` : `${basePath}/${tab.slug}`,
    }));

  const hiddenActive = active && !tabs.some((t) => t.slug === active);

  return (
    <Tabs
      value={tabs.find((t) => t.slug === active)?.slug ?? tabs[0]?.slug ?? 'overview'}
      defaultValue="overview"
      className="w-full"
    >
      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-lg border border-border bg-muted/40 p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.slug === active;

          return (
            <TabsTrigger
              key={tab.slug}
              value={tab.slug}
              asChild
              data-testid={`tab-${tab.slug}`}
              className={cn(
                'gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                'data-[state=active]:bg-background data-[state=active]:shadow-sm'
              )}
            >
              <Link href={tab.href}>
                <Icon
                  className={cn(
                    'h-4 w-4',
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  )}
                />
                <span className="hidden sm:inline">{tab.label}</span>
              </Link>
            </TabsTrigger>
          );
        })}
      </TabsList>
      <TabsContent value={active} />
      {hiddenActive && (
        <div className="pt-4">
          <EmptyState
            icon={<AlertTriangle className="h-5 w-5" />}
            title="Access unavailable"
            description="This tab is not enabled for your role."
            variant="warning"
            action={
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard">Back to dashboard</Link>
              </Button>
            }
          />
        </div>
      )}
    </Tabs>
  );
}
