/**
 * File: properties/[id]/edit/page.tsx
 * Purpose: Edit property page
 * Type: Server Component
 */

import { notFound, redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { EditPropertyForm } from '@/components/property/edit-property-form';
import { AppPageHeader } from '@/components/app/AppPageHeader';
import { AppSection } from '@/components/app/AppSection';

interface EditPropertyPageProps {
  params: {
    id: string;
  };
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const { id } = params;

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    // Redirect to login if not authenticated
    redirect('/auth/login');
  }

  // Check if user has permission to edit (owner or admin only)
  const hasPropertyRoleArgs: Database['public']['Functions']['has_property_role']['Args'] = {
    property_id: id,
    allowed_roles: ['owner', 'editor'],
  };
  const { data: canEdit } = await supabase.rpc('has_property_role', hasPropertyRoleArgs);

  if (!canEdit) {
    // Redirect to property page if no edit permission
    redirect(`/properties/${id}`);
  }

  // Fetch property data
  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();

  if (propertyError || !property) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <AppPageHeader
        title="Edit Property"
        description="Update property details and keep the passport data fresh."
        breadcrumbs={[
          { label: 'Properties', href: '/properties' },
          { label: property.display_address || 'Property', href: `/properties/${property.id}` },
          { label: 'Edit' },
        ]}
      />
      <AppSection>
        <EditPropertyForm property={property} />
      </AppSection>
    </div>
  );
}
