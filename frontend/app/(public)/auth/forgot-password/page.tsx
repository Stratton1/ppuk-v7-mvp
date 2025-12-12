import Link from 'next/link';
import { forgotPasswordAction } from '@/lib/auth/actions';
import { ForgotPasswordForm } from './forgot-password-form';
import { AppPageHeader } from '@/components/app/AppPageHeader';

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center gap-4 px-4 py-10">
      <AppPageHeader
        title="Forgot password"
        description="Enter your email address and we'll send you a link to reset your password."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Forgot Password' }]}
      />
      <ForgotPasswordForm action={forgotPasswordAction} />
      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{' '}
        <Link href="/auth/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
