import Link from 'next/link';
import { loginAction } from '@/lib/auth/actions';
import { LoginForm } from './login-form';
import { Suspense } from 'react';
import { AppPageHeader } from '@/components/app/AppPageHeader';

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center gap-4 px-4 py-10">
      <AppPageHeader
        title="Welcome back"
        description="Sign in to access your dashboard and property passports."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Login' }]}
      />
      <Suspense fallback={null}>
        <LoginForm action={loginAction} />
      </Suspense>
      <p className="text-center text-sm text-muted-foreground">
        Need an account?{' '}
        <Link href="/auth/register" className="text-primary hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
