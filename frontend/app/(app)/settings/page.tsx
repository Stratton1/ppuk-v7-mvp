import { AppPageHeader } from '@/components/app/AppPageHeader';
import { AppSection } from '@/components/app/AppSection';
import { SettingsForm } from '@/components/app/SettingsForm';

export const metadata = {
  title: 'Settings | Property Passport UK',
  description: 'Manage your account settings',
};

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <AppPageHeader
        title="Settings"
        description="Profile settings for your Property Passport account."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Settings' }]}
      />
      <AppSection title="Profile" description="Update your personal details.">
        <SettingsForm />
      </AppSection>
    </div>
  );
}
