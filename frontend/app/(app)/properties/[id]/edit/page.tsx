import { notFound, redirect } from 'next/navigation';
import { AccessUnavailable } from '@/components/app/AccessUnavailable';
import { AppPageHeader } from '@/components/app/AppPageHeader';
import { AppSection } from '@/components/app/AppSection';
import { PropertyEditForm, type EditableProperty } from '@/components/property/PropertyEditForm';
import { getServerUser } from '@/lib/auth/server-user';
import { canEditProperty } from '@/lib/property-utils';
import { createClient as createServerClient } from '@/lib/supabase/server';

interface EditPropertyPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const { id } = await params;

  const user = await getServerUser();
  if (!user) {
    redirect('/auth/login');
  }

  const supabase = createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: property, error: propertyError } = await (supabase as any)
    .from('properties')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (propertyError || !property) {
    notFound();
  }

  const canEdit = user.isAdmin || (await canEditProperty(id));
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
