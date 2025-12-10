import Link from 'next/link';
import { registerAction } from '@/lib/auth/actions';
import { RegisterForm } from './register-form';
import { AppPageHeader } from '@/components/app/AppPageHeader';

export default function RegisterPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center gap-4 px-4 py-10">
      <AppPageHeader
        title="Create account"
        description="Register to create and share property passports securely."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Register' }]}
      />
      <RegisterForm action={registerAction} />
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
