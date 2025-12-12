"use server";

import { redirect } from 'next/navigation';
import { createActionClient } from '@/lib/supabase/server';
import type { RoleType } from '@/types/auth';
import type { ActionResult } from '@/types/forms';

export async function loginAction(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const email = formData.get('email')?.toString() ?? '';
  const password = formData.get('password')?.toString() ?? '';
  const redirectTo = formData.get('redirectTo')?.toString() || '/dashboard';

  const supabase = createActionClient();
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/213ad833-5127-434d-abea-fccdfab15098', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'debug-session',
      runId: 'pre-fix',
      hypothesisId: 'H3',
      location: 'auth/actions.ts:loginAction:before',
      message: 'loginAction invoked',
      data: {
        hasEmail: Boolean(email),
        emailDomain: email.split('@')[1] ?? null,
        redirectTo,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion agent log

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/213ad833-5127-434d-abea-fccdfab15098', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'debug-session',
      runId: 'pre-fix',
      hypothesisId: 'H4',
      location: 'auth/actions.ts:loginAction:after',
      message: 'loginAction result',
      data: {
        error: error?.message ?? null,
        redirectTo,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion agent log

  if (error) {
    return { error: error.message };
  }
  redirect(redirectTo);
  // redirect() throws, so this never executes, but satisfies TypeScript
  return {};
}

export async function registerAction(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const email = formData.get('email')?.toString() ?? '';
  const password = formData.get('password')?.toString() ?? '';
  const primaryRole = (formData.get('primaryRole')?.toString() as RoleType | undefined) ?? 'consumer';

  const supabase = createActionClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error || !data.user) {
    return { error: error?.message ?? 'Unable to register' };
  }

  const { id } = data.user;

  const { error: userInsertError } = await supabase.from('users').insert({
    id,
    email,
    primary_role: primaryRole,
  });
  if (userInsertError) {
    return { error: userInsertError.message };
  }

  await supabase
    .from('profiles')
    .insert({ user_id: id })
    .throwOnError();

  redirect('/dashboard');
  // redirect() throws, so this never executes, but satisfies TypeScript
  return {};
}

export async function logoutAction(): Promise<void> {
  const supabase = createActionClient();
  await supabase.auth.signOut();
  redirect('/auth/login');
}

export async function forgotPasswordAction(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const email = formData.get('email')?.toString() ?? '';

  if (!email) {
    return { error: 'Email is required' };
  }

  const supabase = createActionClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return {};
}

export async function resetPasswordAction(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const password = formData.get('password')?.toString() ?? '';
  const confirmPassword = formData.get('confirmPassword')?.toString() ?? '';

  if (!password || password.length < 8) {
    return { error: 'Password must be at least 8 characters' };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' };
  }

  const supabase = createActionClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  redirect('/auth/login?reset=success');
  return {};
}

export async function updatePasswordAction(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const currentPassword = formData.get('currentPassword')?.toString() ?? '';
  const newPassword = formData.get('newPassword')?.toString() ?? '';
  const confirmPassword = formData.get('confirmPassword')?.toString() ?? '';

  if (!newPassword || newPassword.length < 8) {
    return { error: 'New password must be at least 8 characters' };
  }

  if (newPassword !== confirmPassword) {
    return { error: 'Passwords do not match' };
  }

  const supabase = createActionClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user || !user.email) {
    return { error: 'Not authenticated' };
  }

  // Verify current password by re-authenticating
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (signInError) {
    return { error: 'Current password is incorrect' };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    return { error: error.message };
  }

  return {};
}

export async function updateProfileAction(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const fullName = formData.get('fullName')?.toString() ?? null;
  const avatarUrl = formData.get('avatarUrl')?.toString() ?? null;
  const organisation = formData.get('organisation')?.toString() ?? null;
  const phone = formData.get('phone')?.toString() ?? null;
  const bio = formData.get('bio')?.toString() ?? null;

  const supabase = createActionClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Not authenticated' };
  }

  const { error: userError } = await supabase
    .from('users')
    .update({ full_name: fullName, avatar_url: avatarUrl, organisation })
    .eq('id', user.id);
  if (userError) {
    return { error: userError.message };
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({ user_id: user.id, phone, bio }, { onConflict: 'user_id' });
  if (profileError) {
    return { error: profileError.message };
  }

  return {};
}
