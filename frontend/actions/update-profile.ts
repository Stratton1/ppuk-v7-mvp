"use server";

import { revalidatePath } from 'next/cache';
import { createActionClient } from '@/lib/supabase/server';
import type { ActionResult } from '@/types/forms';
import type { PrimaryRole } from '@/types/auth';

interface UpdateProfileInput {
  full_name?: string | null;
  organisation?: string | null;
  primary_role?: PrimaryRole;
  avatar_url?: string | null;
}

export async function updateProfileAction(
  input: UpdateProfileInput
): Promise<ActionResult> {
  const supabase = createActionClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Authentication required' };
  }

  const { error } = await supabase
    .from('users')
    .update({
      full_name: input.full_name,
      organisation: input.organisation,
      primary_role: input.primary_role,
      avatar_url: input.avatar_url,
    })
    .eq('id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/profile');
  revalidatePath('/settings');
  return { success: true };
}
