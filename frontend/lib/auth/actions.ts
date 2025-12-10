"use server";

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { RoleType } from '@/types/auth';
import type { ActionResult } from '@/types/forms';

export async function loginAction(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const email = formData.get('email')?.toString() ?? '';
  const password = formData.get('password')?.toString() ?? '';
  const redirectTo = formData.get('redirectTo')?.toString() || '/dashboard';

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
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

  const supabase = createClient();
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
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/auth/login');
}

export async function updateProfileAction(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const fullName = formData.get('fullName')?.toString() ?? null;
  const avatarUrl = formData.get('avatarUrl')?.toString() ?? null;
  const organisation = formData.get('organisation')?.toString() ?? null;
  const phone = formData.get('phone')?.toString() ?? null;
  const bio = formData.get('bio')?.toString() ?? null;

  const supabase = createClient();
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
