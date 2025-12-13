import Link from 'next/link';
import { AppPageHeader } from '@/components/app/AppPageHeader';
import { AppSection } from '@/components/app/AppSection';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Tasks | Property Passport UK',
  description: 'Tasks across your properties',
};

export default function TasksPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <AppPageHeader
        title="Tasks"
        description="Track property tasks from inspections to document requests."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Tasks' }]}
      />
      <AppSection title="Coming soon" description="View consolidated tasks across all properties.">
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
          Cross-property tasks are managed inside each property today. Navigate to a property to create or update tasks.
        </div>
        <div className="mt-4">
          <Button asChild>
            <Link href="/properties">Go to properties</Link>
          </Button>
        </div>
      </AppSection>
    </div>
  );
}
