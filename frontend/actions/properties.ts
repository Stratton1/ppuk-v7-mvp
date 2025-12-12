'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getServerUser } from '@/lib/auth/server-user';
import { canEditProperty } from '@/lib/property-utils';
import { createClient } from '@/lib/supabase/server';
import type { ServerUserSession } from '@/types/auth';
import type { ActionResult } from '@/types/forms';

type PropertyActionResult = ActionResult & { propertyId?: string };

const PropertyPayloadSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  address: z.string().min(3, 'Address is required'),
  propertyType: z.string().min(1, 'Property type is required'),
  uprn: z.string().min(1, 'UPRN is required'),
  tenure: z.string().min(1, 'Tenure is required'),
  tags: z.array(z.string()).optional(),
  publicVisibility: z.boolean().optional(),
});

const UpdatePropertySchema = PropertyPayloadSchema.extend({
  propertyId: z.string().min(1, 'Property id is required'),
});

function parseCommonInput(formData: FormData) {
  const tagsValue = (formData.get('tags') ?? '').toString();
  const tags = tagsValue
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  const visibilityRaw = formData.get('public_visibility');
  const publicVisibility = visibilityRaw === 'on' || visibilityRaw === 'true';

  return {
    title: (formData.get('title') ?? '').toString(),
    address: (formData.get('address') ?? '').toString(),
    propertyType: (formData.get('propertyType') ?? '').toString(),
    uprn: (formData.get('uprn') ?? '').toString(),
    tenure: (formData.get('tenure') ?? '').toString(),
    tags,
    publicVisibility,
  };
}

function canCreateProperty(user: ServerUserSession | null) {
  if (!user) return false;
  if (user.isAdmin) return true;
  if (user.primary_role === 'agent' || user.primary_role === 'conveyancer') return true;
  const ownsAProperty = Object.values(user.property_roles ?? {}).some((role) => role.status.includes('owner'));
  if (ownsAProperty) return true;
  // Buyers/consumers are read-only for creation
  if (user.primary_role === 'consumer') return false;
  return false;
}

export async function createPropertyAction(formData: FormData): Promise<PropertyActionResult> {
  try {
    const user = await getServerUser();
    if (!user) return { success: false, error: 'Authentication required' };
    if (!canCreateProperty(user)) {
      return { success: false, error: 'You do not have permission to create properties' };
    }

    const parsed = PropertyPayloadSchema.safeParse(parseCommonInput(formData));
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid property data' };
    }

    const supabase = await createClient();
    const insertPayload = {
      display_address: parsed.data.address,
      uprn: parsed.data.uprn,
      created_by_user_id: user.id,
      status: 'draft',
      public_visibility: parsed.data.publicVisibility ?? false,
      title: parsed.data.title,
      property_type: parsed.data.propertyType,
      tenure: parsed.data.tenure,
      tags: parsed.data.tags,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('properties')
      .insert(insertPayload)
      .select('id')
      .maybeSingle();

    if (error || !data) {
      return { success: false, error: error?.message || 'Failed to create property' };
    }

    revalidatePath('/properties');
    revalidatePath(`/properties/${data.id}`);
    return { success: true, propertyId: data.id };
  } catch (error) {
    console.error('createPropertyAction error', error);
    return { success: false, error: 'Unexpected error creating property' };
  }
}

export async function updatePropertyAction(formData: FormData): Promise<PropertyActionResult> {
  try {
    const user = await getServerUser();
    if (!user) return { success: false, error: 'Authentication required' };

    const parsed = UpdatePropertySchema.safeParse({
      ...parseCommonInput(formData),
      propertyId: (formData.get('propertyId') ?? '').toString(),
    });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid property data' };
    }

    const canEdit = user.isAdmin || (await canEditProperty(parsed.data.propertyId));
    if (!canEdit) return { success: false, error: 'You do not have permission to edit this property' };

    const supabase = await createClient();
    const updatePayload = {
      display_address: parsed.data.address,
      uprn: parsed.data.uprn,
      public_visibility: parsed.data.publicVisibility ?? false,
      title: parsed.data.title,
      property_type: parsed.data.propertyType,
      tenure: parsed.data.tenure,
      tags: parsed.data.tags,
      updated_at: new Date().toISOString(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('properties')
      .update(updatePayload)
      .eq('id', parsed.data.propertyId);

    if (error) {
      return { success: false, error: error.message || 'Failed to update property' };
    }

    revalidatePath(`/properties/${parsed.data.propertyId}`);
    revalidatePath('/properties');
    return { success: true, propertyId: parsed.data.propertyId };
  } catch (error) {
    console.error('updatePropertyAction error', error);
    return { success: false, error: 'Unexpected error updating property' };
  }
}

export { canCreateProperty };
