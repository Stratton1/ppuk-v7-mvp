import Link from 'next/link';
import { AppPageHeader } from '@/components/app/AppPageHeader';
import { AppSection } from '@/components/app/AppSection';
import { InvitationsList } from '@/components/app/InvitationsList';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Invitations | Property Passport UK',
  description: 'Manage invitations for property access',
};

export default function InvitationsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <AppPageHeader
        title="Invitations"
        description="See outstanding invitations to collaborate on properties."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Invitations' }]}
      />
      <AppSection title="Pending invites" description="Invitations are currently sent from each property.">
        <InvitationsList invitations={[]} />
        <div className="mt-4 flex gap-2">
          <Button asChild>
            <Link href="/properties">Go to properties</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </AppSection>
    </div>
  );
}
