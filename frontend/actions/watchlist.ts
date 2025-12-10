/**
 * File: watchlist.ts
 * Purpose: Server actions for watchlist management
 */

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getServerUser } from '@/lib/auth/server-user';
import { z } from 'zod';
import type { Database } from '@/types/supabase';

/**
 * Add to watchlist schema
 */
const AddToWatchlistSchema = z.object({
  propertyId: z.string().uuid(),
  notes: z.string().max(500).optional(),
  alertOnChanges: z.boolean().default(true),
});

/**
 * Update watchlist entry schema
 */
const UpdateWatchlistSchema = z.object({
  watchlistId: z.string().uuid(),
  notes: z.string().max(500).optional(),
  alertOnChanges: z.boolean().optional(),
});

export type WatchlistResult =
  | { success: true; watchlistId: string }
  | { success: false; error: string };

/**
 * Add property to watchlist
 */
export async function addToWatchlist(
  formData: FormData
): Promise<WatchlistResult> {
  try {
    const user = await getServerUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const supabase = await createClient();
    const userId = user.id;

    // Parse and validate form data
    const rawData = {
      propertyId: formData.get('propertyId') as string,
      notes: formData.get('notes') as string | undefined,
      alertOnChanges: formData.get('alertOnChanges') === 'true',
    };

    const validationResult = AddToWatchlistSchema.safeParse(rawData);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0].message,
      };
    }

    const { propertyId, notes, alertOnChanges } = validationResult.data;

    // Check user can view property
    const canViewArgs: Database['public']['Functions']['can_view_property']['Args'] = {
      property_id: propertyId,
    };
    const { data: canView, error: viewError } = await supabase.rpc(
      'can_view_property',
      canViewArgs
    );

    if (viewError || !canView) {
      return {
        success: false,
        error: 'You do not have permission to add this property to your watchlist',
      };
    }

    // Insert or update watchlist entry
    const { data: watchlist, error: insertError } = await supabase
      .from('watchlist')
      .upsert(
        {
          user_id: userId,
          property_id: propertyId,
          notes: notes || null,
          alert_on_changes: alertOnChanges,
        },
        {
          onConflict: 'user_id,property_id',
        }
      )
      .select('id')
      .single();

    if (insertError || !watchlist) {
      console.error('Watchlist add error:', insertError);
      return {
        success: false,
        error: insertError?.message || 'Failed to add to watchlist',
      };
    }

    revalidatePath('/watchlist');
    revalidatePath(`/properties/${propertyId}`);
    return { success: true, watchlistId: watchlist.id };
  } catch (error) {
    console.error('Add to watchlist error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Remove property from watchlist
 */
export async function removeFromWatchlist(
  propertyId: string
): Promise<WatchlistResult> {
  try {
    const user = await getServerUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const supabase = await createClient();
    const userId = user.id;

    // Delete watchlist entry
    const { error: deleteError } = await supabase
      .from('watchlist')
      .delete()
      .eq('user_id', userId)
      .eq('property_id', propertyId);

    if (deleteError) {
      console.error('Watchlist remove error:', deleteError);
      return {
        success: false,
        error: deleteError.message || 'Failed to remove from watchlist',
      };
    }

    revalidatePath('/watchlist');
    revalidatePath(`/properties/${propertyId}`);
    return { success: true, watchlistId: propertyId };
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update watchlist entry
 */
export async function updateWatchlistEntry(
  formData: FormData
): Promise<WatchlistResult> {
  try {
    const user = await getServerUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const supabase = await createClient();
    const userId = user.id;

    // Parse and validate form data
    const rawData = {
      watchlistId: formData.get('watchlistId') as string,
      notes: formData.get('notes') as string | undefined,
      alertOnChanges: formData.get('alertOnChanges') === 'true',
    };

    const validationResult = UpdateWatchlistSchema.safeParse(rawData);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0].message,
      };
    }

    const { watchlistId, notes, alertOnChanges } = validationResult.data;

    // Update watchlist entry
    const updateData: {
      notes?: string | null;
      alert_on_changes?: boolean;
    } = {};

    if (notes !== undefined) {
      updateData.notes = notes || null;
    }
    if (alertOnChanges !== undefined) {
      updateData.alert_on_changes = alertOnChanges;
    }

    const { error: updateError } = await supabase
      .from('watchlist')
      .update(updateData)
      .eq('id', watchlistId)
      .eq('user_id', userId);

    if (updateError) {
      console.error('Watchlist update error:', updateError);
      return {
        success: false,
        error: updateError.message || 'Failed to update watchlist entry',
      };
    }

    revalidatePath('/watchlist');
    return { success: true, watchlistId };
  } catch (error) {
    console.error('Update watchlist error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

