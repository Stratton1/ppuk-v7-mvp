import { redirect } from 'next/navigation';
import { canCreateProperty } from '@/actions/properties';
import { CreatePropertyForm } from '@/components/property/CreatePropertyForm';
import { AppPageHeader } from '@/components/app/AppPageHeader';
import { AppSection } from '@/components/app/AppSection';
import { AccessUnavailable } from '@/components/app/AccessUnavailable';
import { getServerUser } from '@/lib/auth/server-user';

export const metadata = {
  title: 'Create Property | Property Passport UK',
  description: 'Register a new property in the Property Passport UK system',
};

export default async function CreatePropertyPage() {
  const user = await getServerUser();
  if (!user) {
    redirect('/auth/login');
  }

  if (!canCreateProperty(user)) {
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
