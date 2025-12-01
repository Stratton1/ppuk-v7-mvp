import Link from 'next/link';
import { loginAction } from '@/lib/auth/actions';
import { LoginForm } from './login-form';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center">
      <Suspense fallback={null}>
        <LoginForm action={loginAction} />
      </Suspense>
      <p className="mt-4 text-sm text-muted-foreground text-center">
        Need an account?{' '}
        <Link href="/auth/register" className="text-primary hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
