"use server";

import { revalidatePath } from 'next/cache';
import { createActionClient } from '@/lib/supabase/server';
import type { ActionResult } from '@/types/forms';

interface CreateEventInput {
  propertyId: string;
  title: string;
  category: string;
  description?: string | null;
}

export async function createPropertyEventAction(
  input: CreateEventInput
): Promise<ActionResult & { eventId?: string }> {
  const supabase = createActionClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Authentication required' };
  }

  // Map category to event_type
  const eventTypeMap: Record<string, string> = {
    legal: 'note_added',
    survey: 'note_added',
    doc: 'document_uploaded',
    agent: 'note_added',
    general: 'note_added',
  };

  const eventType = eventTypeMap[input.category] || 'note_added';

  const { data, error } = await supabase
    .from('property_events')
    .insert({
      property_id: input.propertyId,
      event_type: eventType,
      actor_user_id: user.id,
      event_payload: {
        title: input.title,
        category: input.category,
        note: input.description,
        message: input.description || input.title,
      },
    })
    .select('id')
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/properties/${input.propertyId}`);
  return { success: true, eventId: data.id };
}

export async function getPropertyEventsAction(
  propertyId: string
): Promise<ActionResult & { events?: unknown[] }> {
  const supabase = createServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Authentication required' };
  }

  const { data: events, error } = await supabase
    .from('property_events')
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { success: true, events: events || [] };
}
