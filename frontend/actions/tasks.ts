"use server";

import { revalidatePath } from 'next/cache';
import { createActionClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase';

export type TaskInsertWithoutUser = Omit<
  Database['public']['Tables']['tasks']['Insert'],
  'created_by_user_id'
>;

export async function createTaskAction(task: TaskInsertWithoutUser): Promise<void> {
  const supabase = await createActionClient();
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

// Notes subsystem removed in v7 schema; add a new implementation if the feature returns.
