/**
 * File: properties/page.tsx
 * Purpose: Public property listing page
 * Type: Server Component (no authentication required)
 */

import { PropertyList } from '@/components/property/property-list';

export const metadata = {
  title: 'Properties | Property Passport UK',
  description: 'Browse all active properties in the Property Passport UK system',
};

export default function PropertiesPage() {
  return <PropertyList />;
}
