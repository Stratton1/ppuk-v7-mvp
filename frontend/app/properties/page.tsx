/**
 * File: properties/page.tsx
 * Purpose: Public property listing page
 * Type: Server Component (no authentication required)
 */

import { PropertyList } from '@/components/property/property-list';
import { AppPageHeader } from '@/components/app/AppPageHeader';
import { AppSection } from '@/components/app/AppSection';

export const metadata = {
  title: 'Properties | Property Passport UK',
  description: 'Browse all active properties in the Property Passport UK system',
};

export default function PropertiesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      <AppPageHeader
        title="Active Properties"
        description="Browse all available properties in the Property Passport UK system."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Properties' }]}
      />
      <AppSection padded={false}>
        <PropertyList />
      </AppSection>
    </div>
  );
}
