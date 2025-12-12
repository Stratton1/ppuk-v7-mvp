import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { updateProfileAction } from '@/lib/auth/actions';
import { ProfileForm } from './profile-form';
import { AppPageHeader } from '@/components/app/AppPageHeader';
import { AppSection } from '@/components/app/AppSection';
import type { Database } from '@/types/supabase';

type UserRow = Database['public']['Tables']['users']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export default async function ProfilePage() {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login');
  }

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const userRecord = userData as UserRow | null;
  const profileRecord = profileData as ProfileRow | null;

  return (
    <div className="space-y-6">
      <AppPageHeader
        title="Profile"
        description="Manage your personal information and account settings."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Profile' },
        ]}
      />

      <AppSection
        id="profile-info"
        title="Personal information"
        description="Update your name, organisation, and contact details."
      >
        <ProfileForm
          action={updateProfileAction}
          initialData={{
            email: user.email || '',
            fullName: userRecord?.full_name || '',
            avatarUrl: userRecord?.avatar_url || '',
            organisation: userRecord?.organisation || '',
            phone: profileRecord?.phone || '',
            bio: profileRecord?.bio || '',
            primaryRole: userRecord?.primary_role || 'consumer',
          }}
        />
      </AppSection>
    </div>
  );
}
