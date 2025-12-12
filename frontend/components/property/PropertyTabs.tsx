'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccessUnavailable } from '@/components/app/AccessUnavailable';

type PropertyTabsProps = {
  propertyId: string;
  allowedTabs?: string[];
};

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

  const tabs = [
    { slug: 'overview', label: 'Overview', href: basePath },
    { slug: 'details', label: 'Details', href: `${basePath}/details` },
    { slug: 'media', label: 'Media', href: `${basePath}/media` },
    { slug: 'documents', label: 'Documents', href: `${basePath}/documents` },
    { slug: 'issues', label: 'Issues', href: `${basePath}/issues` },
    { slug: 'tasks', label: 'Tasks', href: `${basePath}#tasks` },
    { slug: 'history', label: 'History', href: `${basePath}/history` },
  ].filter((tab) => !allowedTabs || allowedTabs.includes(tab.slug));

  const hiddenActive = active && !tabs.some((t) => t.slug === active);

  return (
    <Tabs value={tabs.find((t) => t.slug === active)?.slug ?? tabs[0]?.slug ?? 'overview'} defaultValue="overview" className="w-full">
      <TabsList className="flex w-full flex-wrap justify-start gap-2 rounded-xl bg-muted/50 px-2 py-2">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.slug}
            value={tab.slug}
            asChild
            data-testid={`tab-${tab.slug}`}
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Link href={tab.href}>{tab.label}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value={active} />
      {hiddenActive && (
        <div className="pt-4">
          <AccessUnavailable
            title="Access unavailable"
            description="This tab is not enabled for your role."
            optionalActionHref="/dashboard"
            optionalActionLabel="Back to dashboard"
          />
        </div>
      )}
    </Tabs>
  );
}
