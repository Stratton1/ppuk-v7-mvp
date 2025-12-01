"use server";

import { revalidatePath } from 'next/cache';
import { createClient as createServerClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase';

export type TaskInsertWithoutUser = Omit<
  Database['public']['Tables']['tasks']['Insert'],
  'created_by_user_id'
>;

export async function createTaskAction(task: TaskInsertWithoutUser): Promise<void> {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');

  const taskWithUser: Database['public']['Tables']['tasks']['Insert'] = {
    ...task,
    created_by_user_id: user.id,
  };

  const { error } = await supabase.from('tasks').insert(taskWithUser);
  if (error) throw error;
  revalidatePath(`/properties/${task.property_id}`);
}

// TODO: Notes functionality removed in v7 schema migration
// Notes table was dropped - need to re-implement if needed
// export async function createNoteAction(
//   note: Omit<Database['public']['Tables']['property_notes']['Insert'], 'created_by_user_id'>
// ): Promise<void> {
//   const supabase = createServerClient();
//   const { data: { user } } = await supabase.auth.getUser();
//   if (!user) throw new Error('Authentication required');
//
//   const noteWithUser: Database['public']['Tables']['property_notes']['Insert'] = {
//     ...note,
//     created_by_user_id: user.id,
//   };
//
//   // Type assertion needed due to RLS type inference issue
//   const { error } = await (supabase.from('property_notes').insert as any)(noteWithUser);
//   if (error) throw error;
//   revalidatePath(`/properties/${note.property_id}`);
// }
