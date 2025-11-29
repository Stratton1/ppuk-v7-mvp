"use server";

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase';

export async function createTaskAction(
  task: Omit<Database['public']['Tables']['property_tasks']['Insert'], 'created_by_user_id'>
): Promise<void> {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');

  const taskWithUser: Database['public']['Tables']['property_tasks']['Insert'] = {
    ...task,
    created_by_user_id: user.id,
  };

  // Type assertion needed due to RLS type inference issue
  const { error } = await (supabase.from('property_tasks').insert as any)(taskWithUser);
  if (error) throw error;
  revalidatePath(`/properties/${task.property_id}`);
}

export async function createNoteAction(
  note: Omit<Database['public']['Tables']['property_notes']['Insert'], 'created_by_user_id'>
): Promise<void> {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');

  const noteWithUser: Database['public']['Tables']['property_notes']['Insert'] = {
    ...note,
    created_by_user_id: user.id,
  };

  // Type assertion needed due to RLS type inference issue
  const { error } = await (supabase.from('property_notes').insert as any)(noteWithUser);
  if (error) throw error;
  revalidatePath(`/properties/${note.property_id}`);
}
