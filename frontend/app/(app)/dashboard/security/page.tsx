import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { updatePasswordAction } from '@/lib/auth/actions';
import { SecurityForm } from './security-form';
import { AppPageHeader } from '@/components/app/AppPageHeader';
import { AppSection } from '@/components/app/AppSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function SecurityPage() {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login');
  }

  return (
    <div className="space-y-6">
      <AppPageHeader
        title="Security"
        description="Manage your password and account security settings."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Security' },
        ]}
      />

      <AppSection
        id="change-password"
        title="Change password"
        description="Update your password to keep your account secure."
      >
        <SecurityForm action={updatePasswordAction} />
      </AppSection>

      <AppSection
        id="account-info"
        title="Account information"
        description="Details about your account and login history."
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account details</CardTitle>
            <CardDescription>
              Information about your account status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-sm">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Account created</p>
                <p className="text-sm">
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last sign in</p>
                <p className="text-sm">
                  {user.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email confirmed</p>
                <p className="text-sm">
                  {user.email_confirmed_at ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </AppSection>
    </div>
  );
}
