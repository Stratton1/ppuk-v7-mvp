"use server";

import { revalidatePath } from 'next/cache';
import { createClient as createServerClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase';

export async function setPublicVisibilityAction(formData: FormData): Promise<void> {
  const propertyId = formData.get('propertyId')?.toString();
  const visible = formData.get('visible')?.toString() === 'true';

  if (!propertyId) {
    throw new Error('propertyId is required');
  }

  const supabase = createServerClient();

  const visibilityArgs: Database['public']['Functions']['set_public_visibility']['Args'] = {
    property_id: propertyId,
    visible,
  };

  // Type assertion needed due to Supabase RPC type inference issue
  const { error: visibilityError } = await supabase.rpc('set_public_visibility', visibilityArgs);

  if (visibilityError) {
    throw visibilityError;
  }

  // Regenerate slug when turning on visibility and slug is missing
  if (visible) {
    const regenerateArgs: Database['public']['Functions']['regenerate_slug']['Args'] = {
      property_id: propertyId,
    };
    await supabase.rpc('regenerate_slug', regenerateArgs);
  }

  revalidatePath(`/properties/${propertyId}`);
}
