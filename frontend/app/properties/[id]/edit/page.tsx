/**
 * File: properties/[id]/edit/page.tsx
 * Purpose: Edit property page
 * Type: Server Component
 */

import { notFound, redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { EditPropertyForm } from '@/components/property/edit-property-form';

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
    <div className="container mx-auto py-8">
      <EditPropertyForm property={property} />
    </div>
  );
}
