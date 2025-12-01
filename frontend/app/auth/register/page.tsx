import Link from 'next/link';
import { registerAction } from '@/lib/auth/actions';
import { RegisterForm } from './register-form';

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center">
      <RegisterForm action={registerAction} />
      <p className="mt-4 text-sm text-muted-foreground text-center">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
