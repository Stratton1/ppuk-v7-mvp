import { canCreateProperty } from '@/actions/properties';
import { CreatePropertyForm } from '@/components/property/CreatePropertyForm';
import { AppPageHeader } from '@/components/app/AppPageHeader';
import { AppSection } from '@/components/app/AppSection';
import { AccessUnavailable } from '@/components/app/AccessUnavailable';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Create Property | Property Passport UK',
  description: 'Register a new property in the Property Passport UK system',
};

/**
 * Create Property Page - Server Component
 * Auth is enforced by middleware. Do NOT add auth checks here.
 */
export default async function CreatePropertyPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const { data: userRow } = authUser
    ? await supabase.from('users').select('id, primary_role').eq('id', authUser.id).maybeSingle()
    : { data: null };

  // Build user object for permission check
  const user = authUser
    ? {
        id: authUser.id,
        email: authUser.email ?? null,
        full_name: null,
        primary_role: userRow?.primary_role ?? null,
        property_roles: {} as Record<string, { status: ('owner' | 'buyer' | 'tenant')[]; permission: 'editor' | 'viewer' | null }>,
        isAdmin: userRow?.primary_role === 'admin',
      }
    : null;

  if (!user || !canCreateProperty(user)) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <AppPageHeader
          title="Create Property"
          description="Register a new property and automatically assign yourself as owner."
          breadcrumbs={[{ label: 'Properties', href: '/properties' }, { label: 'Create' }]}
        />
        <AccessUnavailable
          title="You cannot create properties"
          description="Your account does not have permission to create new property passports."
          optionalActionHref="/properties"
          optionalActionLabel="Back to properties"
        />
      </div>
    );
  }

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
