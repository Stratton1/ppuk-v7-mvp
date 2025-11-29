/**
 * File: properties/create/page.tsx
 * Purpose: Property creation page
 * Type: Server Component (imports Client Component form)
 * Access: Authenticated users only
 */

import { CreatePropertyForm } from '@/components/property/create-property-form';

export const metadata = {
  title: 'Create Property | Property Passport UK',
  description: 'Register a new property in the Property Passport UK system',
};

export default function CreatePropertyPage() {
  return (
    <div className="container mx-auto py-8">
      <CreatePropertyForm />
    </div>
  );
}

