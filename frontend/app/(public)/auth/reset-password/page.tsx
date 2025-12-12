import Link from 'next/link';
import { resetPasswordAction } from '@/lib/auth/actions';
import { ResetPasswordForm } from './reset-password-form';
import { AppPageHeader } from '@/components/app/AppPageHeader';

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center gap-4 px-4 py-10">
      <AppPageHeader
        title="Reset password"
        description="Enter your new password below."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Reset Password' }]}
      />
      <ResetPasswordForm action={resetPasswordAction} />
      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{' '}
        <Link href="/auth/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
