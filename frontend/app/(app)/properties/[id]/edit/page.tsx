import { use } from 'react';
import { notFound } from 'next/navigation';
import { AccessUnavailable } from '@/components/app/AccessUnavailable';
import { AppPageHeader } from '@/components/app/AppPageHeader';
import { AppSection } from '@/components/app/AppSection';
import { PropertyEditForm, type EditableProperty } from '@/components/property/PropertyEditForm';
import { canEditProperty } from '@/lib/property-utils';
import { createClient } from '@/lib/supabase/server';

interface EditPropertyPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Edit Property Page - Server Component
 * Auth is enforced by middleware. Do NOT add auth checks here.
 */
export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const { id } = use(params);
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const { data: userRow } = authUser
    ? await supabase.from('users').select('id, primary_role').eq('id', authUser.id).maybeSingle()
    : { data: null };

  const isAdmin = userRow?.primary_role === 'admin';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: property, error: propertyError } = await (supabase as any)
    .from('properties')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (propertyError || !property) {
    notFound();
  }

  const canEdit = isAdmin || (await canEditProperty(id));
  if (!canEdit) {
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
        <AccessUnavailable
          title="You cannot edit this property"
          description="Your account does not have permission to make changes here."
          optionalActionHref={`/properties/${id}`}
          optionalActionLabel="Back to property"
        />
      </div>
    );
  }

  const editableProperty: EditableProperty = {
    id: property.id,
    display_address: property.display_address,
    uprn: property.uprn,
    public_visibility: property.public_visibility,
    property_type: property.property_type,
    tenure: property.tenure,
    title: property.title,
    tags: property.tags,
  };

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
        <PropertyEditForm property={editableProperty} />
      </AppSection>
    </div>
  );
}
