'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getServerUser } from '@/lib/auth/server-user';
import { flagRowToIssue, mapSeverity, type IssueCategory, type IssueSeverity, type IssueStatus } from '@/lib/issues/types';
import type { ActionResult } from '@/types/forms';
import type { Database } from '@/types/supabase';

const categoryOptions: IssueCategory[] = ['safety', 'compliance', 'documents', 'structural', 'legal', 'general'];
const severityOptions: IssueSeverity[] = ['low', 'medium', 'high', 'critical'];
const statusOptions: IssueStatus[] = ['open', 'in_progress', 'resolved', 'closed'];

const CreateIssueSchema = z.object({
  propertyId: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(200),
  category: z.enum(categoryOptions),
  severity: z.enum(severityOptions),
  description: z.string().max(2000).optional().nullable(),
  dueDate: z.string().optional().nullable(),
});

const UpdateIssueSchema = z.object({
  issueId: z.string().uuid(),
  title: z.string().max(200).optional(),
  category: z.enum(categoryOptions).optional(),
  severity: z.enum(severityOptions).optional(),
  description: z.string().max(2000).optional().nullable(),
  dueDate: z.string().optional().nullable(),
});

const ChangeStatusSchema = z.object({
  issueId: z.string().uuid(),
  status: z.enum(statusOptions),
});

const CommentSchema = z.object({
  issueId: z.string().uuid(),
  comment: z.string().min(1, 'Comment is required').max(2000),
});

function categoryToFlagType(category: IssueCategory): string {
  switch (category) {
    case 'safety':
      return 'risk';
    case 'compliance':
      return 'compliance';
    case 'documents':
      return 'document';
    case 'structural':
      return 'risk';
    case 'legal':
      return 'ownership';
    case 'general':
    default:
      return 'other';
  }
}

function statusToFlagStatus(status: IssueStatus): string {
  if (status === 'in_progress') return 'in_review';
  if (status === 'resolved') return 'resolved';
  if (status === 'closed') return 'dismissed';
  return 'open';
}

function composeDescription(title: string, description?: string | null, dueDate?: string | null): string {
  const parts = [title.trim()];
  if (description) parts.push(description.trim());
  if (dueDate) parts.push(`Due: ${dueDate}`);
  return parts.join('\n\n');
}

/**
 * Create an issue (property flag)
 */
export async function createIssueAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await getServerUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const parsed = CreateIssueSchema.safeParse({
      propertyId: formData.get('propertyId'),
      title: formData.get('title'),
      category: formData.get('category'),
      severity: formData.get('severity'),
      description: formData.get('description'),
      dueDate: formData.get('dueDate'),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid input' };
    }

    const { propertyId, title, category, severity, description, dueDate } = parsed.data;

    const supabase = await createClient();
    const { data: canEdit } = await supabase.rpc('can_edit_property', { property_id: propertyId });

    if (!canEdit && !user.isAdmin) {
      return { success: false, error: 'You do not have permission to create issues for this property' };
    }

    const payloadDescription = composeDescription(title, description, dueDate || null);

    // Note: property_flags table is not in generated Supabase types yet.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('property_flags')
      .insert({
        property_id: propertyId,
        created_by_user_id: user.id,
        flag_type: categoryToFlagType(category),
        severity,
        status: 'open',
        description: payloadDescription,
      });

    if (error) {
      console.error('createIssueAction insert error', error);
      return { success: false, error: 'Unable to create issue' };
    }

    await supabase.from('property_events').insert({
      property_id: propertyId,
      actor_user_id: user.id,
      event_type: 'flag_added',
      event_payload: { title, category, severity },
    });

    revalidatePath(`/properties/${propertyId}`);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('createIssueAction error', error);
    return { success: false, error: 'Unexpected error' };
  }
}

/**
 * Update issue details (title/description/severity/category)
 */
export async function updateIssueAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await getServerUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const parsed = UpdateIssueSchema.safeParse({
      issueId: formData.get('issueId'),
      title: formData.get('title'),
      category: formData.get('category'),
      severity: formData.get('severity'),
      description: formData.get('description'),
      dueDate: formData.get('dueDate'),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid input' };
    }

    const { issueId, title, category, severity, description, dueDate } = parsed.data;

    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing, error: fetchError } = await (supabase as any)
      .from('property_flags')
      .select('*')
      .eq('id', issueId)
      .is('deleted_at', null)
      .maybeSingle();

    if (fetchError || !existing) {
      return { success: false, error: 'Issue not found' };
    }

    const canEditArgs: Database['public']['Functions']['can_edit_property']['Args'] = {
      property_id: existing.property_id,
    };
    const { data: canEdit } = await supabase.rpc('can_edit_property', canEditArgs);
    const isCreator = existing.created_by_user_id === user.id;
    if (!canEdit && !isCreator && !user.isAdmin) {
      return { success: false, error: 'You do not have permission to update this issue' };
    }

    const currentIssue = flagRowToIssue(existing);
    const nextTitle = title ?? currentIssue.title;
    const nextDescription = description ?? currentIssue.description;
    const nextDueDate = dueDate ?? currentIssue.dueDate ?? null;

    const updateData: Record<string, unknown> = {};

    if (severity) updateData.severity = mapSeverity(severity);
    if (category) updateData.flag_type = categoryToFlagType(category);

    // Persist title/description/due date inside description field until schema supports first-class fields
    updateData.description = composeDescription(nextTitle, nextDescription, nextDueDate);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
      .from('property_flags')
      .update(updateData)
      .eq('id', issueId);

    if (updateError) {
      console.error('updateIssueAction error', updateError);
      return { success: false, error: 'Unable to update issue' };
    }

    await supabase.from('property_events').insert({
      property_id: existing.property_id,
      actor_user_id: user.id,
      event_type: 'flag_updated',
      event_payload: { issueId, title: nextTitle, severity: severity ?? currentIssue.severity },
    });

    revalidatePath(`/properties/${existing.property_id}`);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('updateIssueAction error', error);
    return { success: false, error: 'Unexpected error' };
  }
}

/**
 * Change issue status
 */
export async function changeIssueStatusAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await getServerUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const parsed = ChangeStatusSchema.safeParse({
      issueId: formData.get('issueId'),
      status: formData.get('status'),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid input' };
    }

    const { issueId, status } = parsed.data;
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing, error: fetchError } = await (supabase as any)
      .from('property_flags')
      .select('property_id, created_by_user_id, status')
      .eq('id', issueId)
      .is('deleted_at', null)
      .maybeSingle();

    if (fetchError || !existing) {
      return { success: false, error: 'Issue not found' };
    }

    const canEditArgs: Database['public']['Functions']['can_edit_property']['Args'] = {
      property_id: existing.property_id,
    };
    const { data: canEdit } = await supabase.rpc('can_edit_property', canEditArgs);
    const isCreator = existing.created_by_user_id === user.id;

    if (!canEdit && !isCreator && !user.isAdmin) {
      return { success: false, error: 'You do not have permission to change this issue' };
    }

    const flagStatus = statusToFlagStatus(status);
    const updateData: Record<string, unknown> = {
      status: flagStatus,
    };

    if (flagStatus === 'resolved' || flagStatus === 'dismissed') {
      updateData.resolved_at = new Date().toISOString();
      updateData.resolved_by_user_id = user.id;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
      .from('property_flags')
      .update(updateData)
      .eq('id', issueId);

    if (updateError) {
      console.error('changeIssueStatusAction error', updateError);
      return { success: false, error: 'Unable to update issue status' };
    }

    await supabase.from('property_events').insert({
      property_id: existing.property_id,
      actor_user_id: user.id,
      event_type: 'flag_updated',
      event_payload: { issueId, status },
    });

    revalidatePath(`/properties/${existing.property_id}`);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('changeIssueStatusAction error', error);
    return { success: false, error: 'Unexpected error' };
  }
}

/**
 * Soft delete issue
 */
export async function deleteIssueAction(issueId: string): Promise<ActionResult> {
  try {
    const user = await getServerUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing, error: fetchError } = await (supabase as any)
      .from('property_flags')
      .select('property_id, created_by_user_id')
      .eq('id', issueId)
      .is('deleted_at', null)
      .maybeSingle();

    if (fetchError || !existing) {
      return { success: false, error: 'Issue not found' };
    }

    const canEditArgs: Database['public']['Functions']['can_edit_property']['Args'] = {
      property_id: existing.property_id,
    };
    const { data: canEdit } = await supabase.rpc('can_edit_property', canEditArgs);
    const isCreator = existing.created_by_user_id === user.id;

    if (!canEdit && !isCreator && !user.isAdmin) {
      return { success: false, error: 'You do not have permission to delete this issue' };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: deleteError } = await (supabase as any)
      .from('property_flags')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', issueId);

    if (deleteError) {
      return { success: false, error: 'Unable to delete issue' };
    }

    revalidatePath(`/properties/${existing.property_id}`);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('deleteIssueAction error', error);
    return { success: false, error: 'Unexpected error' };
  }
}

/**
 * Add a comment to an issue (stored in property_events timeline)
 */
export async function addIssueCommentAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await getServerUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const parsed = CommentSchema.safeParse({
      issueId: formData.get('issueId'),
      comment: formData.get('comment'),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid input' };
    }

    const { issueId, comment } = parsed.data;
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing, error: fetchError } = await (supabase as any)
      .from('property_flags')
      .select('property_id')
      .eq('id', issueId)
      .is('deleted_at', null)
      .maybeSingle();

    if (fetchError || !existing) {
      return { success: false, error: 'Issue not found' };
    }

    await supabase.from('property_events').insert({
      property_id: existing.property_id,
      actor_user_id: user.id,
      event_type: 'flag_comment',
      event_payload: { issueId, comment },
    });

    revalidatePath(`/properties/${existing.property_id}`);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('addIssueCommentAction error', error);
    return { success: false, error: 'Unexpected error' };
  }
}
