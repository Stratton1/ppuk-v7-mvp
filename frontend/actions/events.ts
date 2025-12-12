'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getServerUser } from '@/lib/auth/server-user';
import { createClient } from '@/lib/supabase/server';
import { canEditProperty } from '@/lib/property-utils';
import { documentToEvents, eventRowToEntry, flagToEvents, mediaToEvents, propertyToEvents, type TimelineEntry } from '@/lib/events/types';
import type { ActionResult } from '@/types/forms';

const EventSchema = z.object({
  propertyId: z.string().uuid(),
  type: z.string(),
  message: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

const CommentSchema = z.object({
  targetId: z.string().min(1, 'targetId required'),
  targetType: z.enum(['issue', 'document', 'media', 'property']),
  text: z.string().min(1, 'Comment cannot be empty').max(5000, 'Too long'),
  propertyId: z.string().min(1, 'propertyId required'),
});

export async function createEventAction(input: {
  propertyId: string;
  type: string;
  message?: string;
  metadata?: Record<string, unknown>;
}): Promise<ActionResult & { event?: TimelineEntry }> {
  try {
    const user = await getServerUser();
    if (!user) return { success: false, error: 'Not authenticated' };
    const parsed = EventSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message || 'Invalid input' };
    const canEdit = await canEditProperty(parsed.data.propertyId);
    if (!canEdit) return { success: false, error: 'No permission' };

    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('property_events')
      .insert({
        property_id: parsed.data.propertyId,
        event_type: parsed.data.type,
        actor_user_id: user.id,
        event_payload: parsed.data.metadata ?? { message: parsed.data.message },
      })
      .select('*')
      .maybeSingle();
    if (error) return { success: false, error: 'Failed to create event' };
    const event = eventRowToEntry(data);
    revalidatePath(`/properties/${parsed.data.propertyId}`);
    revalidatePath('/dashboard');
    return { success: true, event };
  } catch (error) {
    console.error('createEventAction error', error);
    return { success: false, error: 'Unexpected error' };
  }
}

export async function createCommentAction(input: {
  targetId: string;
  targetType: 'issue' | 'document' | 'media' | 'property';
  text: string;
  propertyId: string;
}): Promise<ActionResult> {
  try {
    const user = await getServerUser();
    if (!user) return { success: false, error: 'Not authenticated' };
    const parsed = CommentSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message || 'Invalid input' };

    const canEdit = await canEditProperty(parsed.data.propertyId);
    if (!canEdit) return { success: false, error: 'No permission to comment' };

    const supabase = await createClient();
    const { error } = await supabase.from('property_events').insert({
      property_id: parsed.data.propertyId,
      event_type: 'comment.added',
      actor_user_id: user.id,
      event_payload: {
        target_id: parsed.data.targetId,
        target_type: parsed.data.targetType,
        message: parsed.data.text,
      },
    });
    if (error) return { success: false, error: 'Failed to add comment' };
    revalidatePath(`/properties/${parsed.data.propertyId}`);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('createCommentAction error', error);
    return { success: false, error: 'Unexpected error' };
  }
}

export async function getEventsForProperty(propertyId: string): Promise<TimelineEntry[]> {
  try {
    const user = await getServerUser();
    if (!user) return [];
    const supabase = await createClient();
    const { data: canView } = await supabase.rpc('can_view_property', { property_id: propertyId });
    if (!canView && !user.isAdmin) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: eventRows } = await (supabase as any)
      .from('property_events')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })
      .catch(() => ({ data: [] }));

    // documents
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: documentRows } = await (supabase as any)
      .from('documents')
      .select('*')
      .eq('property_id', propertyId)
      .is('deleted_at', null)
      .catch(() => ({ data: [] }));
    // media
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: mediaRows } = await (supabase as any)
      .from('media')
      .select('*')
      .eq('property_id', propertyId)
      .is('deleted_at', null)
      .catch(() => ({ data: [] }));
    // flags
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: flagRows } = await (supabase as any)
      .from('property_flags')
      .select('*')
      .eq('property_id', propertyId)
      .is('deleted_at', null)
      .catch(() => ({ data: [] }));
    const propertyRow = await supabase.from('properties').select('*').eq('id', propertyId).maybeSingle();

    const entries: TimelineEntry[] = [];
    if (propertyRow.data) entries.push(...propertyToEvents(propertyRow.data));
    (eventRows || []).forEach((row: unknown) => entries.push(eventRowToEntry(row)));
    (documentRows || []).forEach((row: unknown) => entries.push(...documentToEvents(row)));
    (mediaRows || []).forEach((row: unknown) => entries.push(...mediaToEvents(row)));
    (flagRows || []).forEach((row: unknown) => entries.push(...flagToEvents(row)));

    return entries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (error) {
    console.error('getEventsForProperty error', error);
    return [];
  }
}

export async function getCommentsFor(targetType: string, targetId: string): Promise<TimelineEntry[]> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rows } = await (supabase as any)
      .from('property_events')
      .select('*')
      .eq('event_type', 'comment.added')
      .contains('event_payload', { target_id: targetId, target_type: targetType })
      .order('created_at', { ascending: false })
      .catch(() => ({ data: [] }));
    return (rows || []).map((row: unknown) => eventRowToEntry(row));
  } catch (error) {
    console.error('getCommentsFor error', error);
    return [];
  }
}
