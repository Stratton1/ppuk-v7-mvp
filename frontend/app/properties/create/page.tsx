/**
 * File: properties/create/page.tsx
 * Purpose: Property creation page
 * Type: Server Component (imports Client Component form)
 * Access: Authenticated users only
 */

import { CreatePropertyForm } from '@/components/property/create-property-form';
import { AppPageHeader } from '@/components/app/AppPageHeader';
import { AppSection } from '@/components/app/AppSection';

export const metadata = {
  title: 'Create Property | Property Passport UK',
  description: 'Register a new property in the Property Passport UK system',
};

export default function CreatePropertyPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <AppPageHeader
        title="Create Property"
        description="Register a new property and automatically assign yourself as owner."
        breadcrumbs={[{ label: 'Properties', href: '/properties' }, { label: 'Create' }]}
      />
      <AppSection>
        <CreatePropertyForm />
      </AppSection>
    </div>
  );
}
