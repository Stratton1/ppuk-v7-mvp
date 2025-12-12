"use server";

import { revalidatePath } from 'next/cache';
import { createClient as createServerClient } from '@/lib/supabase/server';
import type { ActionResult } from '@/types/forms';

interface CreateTaskInput {
  propertyId: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string | null;
}

export async function createPropertyTaskAction(
  input: CreateTaskInput
): Promise<ActionResult & { taskId?: string }> {
  const supabase = createServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Authentication required' };
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      property_id: input.propertyId,
      title: input.title,
      description: input.description || null,
      priority: input.priority,
      due_date: input.dueDate || null,
      status: 'open',
      created_by_user_id: user.id,
    })
    .select('id')
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/properties/${input.propertyId}`);
  return { success: true, taskId: data.id };
}

export async function toggleTaskCompletionAction(
  taskId: string,
  propertyId: string
): Promise<ActionResult & { status?: string }> {
  const supabase = createServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Authentication required' };
  }

  // Get current task status
  const { data: task, error: fetchError } = await supabase
    .from('tasks')
    .select('status')
    .eq('id', taskId)
    .single();

  if (fetchError || !task) {
    return { error: 'Task not found' };
  }

  const newStatus = task.status === 'completed' ? 'open' : 'completed';

  const { error: updateError } = await supabase
    .from('tasks')
    .update({ status: newStatus })
    .eq('id', taskId);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath(`/properties/${propertyId}`);
  return { success: true, status: newStatus };
}

export async function updateTaskAction(
  taskId: string,
  propertyId: string,
  updates: {
    title?: string;
    description?: string | null;
    priority?: 'low' | 'medium' | 'high';
    status?: string;
    dueDate?: string | null;
  }
): Promise<ActionResult> {
  const supabase = createServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Authentication required' };
  }

  const { error } = await supabase
    .from('tasks')
    .update({
      title: updates.title,
      description: updates.description,
      priority: updates.priority,
      status: updates.status,
      due_date: updates.dueDate,
    })
    .eq('id', taskId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/properties/${propertyId}`);
  return { success: true };
}

export async function deleteTaskAction(
  taskId: string,
  propertyId: string
): Promise<ActionResult> {
  const supabase = createServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Authentication required' };
  }

  // Soft delete
  const { error } = await supabase
    .from('tasks')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', taskId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/properties/${propertyId}`);
  return { success: true };
}
