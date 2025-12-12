/**
 * File: rls-test-helpers.ts
 * Purpose: Helper functions for RLS tests
 */

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_TEST_URL!;
const serviceKey = process.env.SUPABASE_TEST_SERVICE_ROLE_KEY!;
const anonKey = process.env.SUPABASE_TEST_ANON_KEY!;

export interface TestUser {
  id: string;
  email: string;
  token: string;
  client: SupabaseClient;
}

export interface TestProperty {
  id: string;
  uprn: string;
  display_address: string;
}

/**
 * Create admin client (service role)
 */
export function createAdminClient() {
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Create anonymous client
 */
export function createAnonClient() {
  return createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Create a test user with specified primary role
 */
export async function createTestUser(
  adminClient: ReturnType<typeof createAdminClient>,
  email: string,
  primaryRole: 'consumer' | 'agent' | 'conveyancer' | 'surveyor' | 'admin',
  password: string = 'password123'
): Promise<{ id: string; email: string }> {
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error || !data.user) {
    throw error || new Error('User creation failed');
  }

  await adminClient.from('users').upsert({
    id: data.user.id,
    email,
    full_name: email,
    primary_role: primaryRole,
  });

  return { id: data.user.id, email };
}

/**
 * Sign in a user and return token and client
 */
export async function signInUser(
  email: string,
  password: string = 'password123'
): Promise<TestUser> {
  const anonClient = createAnonClient();
  const { data, error } = await anonClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    throw error || new Error('Sign in failed');
  }

  const client = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${data.session.access_token}` } },
  });

  return {
    id: data.user.id,
    email,
    token: data.session.access_token,
    client,
  };
}

/**
 * Create a test property
 */
export async function createTestProperty(
  ownerClient: SupabaseClient,
  uprn: string = `UPRN-${Date.now()}`,
  displayAddress: string = 'Test Property Address'
): Promise<TestProperty> {
  const { data, error } = await ownerClient.rpc('create_property_with_role', {
    p_uprn: uprn,
    p_display_address: displayAddress,
    p_latitude: null,
    p_longitude: null,
    p_status: 'draft',
  });

  if (error || !data) {
    throw error || new Error('Property creation failed');
  }

  return {
    id: data as string,
    uprn,
    display_address: displayAddress,
  };
}

/**
 * Grant property role to a user
 */
export async function grantPropertyRole(
  ownerClient: SupabaseClient,
  targetUserId: string,
  propertyId: string,
  status: 'owner' | 'buyer' | 'tenant' | null = null,
  permission: 'editor' | 'viewer',
  expiresAt: string | null = null
): Promise<void> {
  const { error } = await ownerClient.rpc('grant_property_role', {
    target_user_id: targetUserId,
    property_id: propertyId,
    status: status,
    permission: permission,
    expires_at: expiresAt,
  });

  if (error) {
    throw error;
  }
}

/**
 * Set property public visibility
 */
export async function setPublicVisibility(
  ownerClient: SupabaseClient,
  propertyId: string,
  visible: boolean
): Promise<void> {
  const { error } = await ownerClient.rpc('set_public_visibility', {
    property_id: propertyId,
    visible,
  });

  if (error) {
    throw error;
  }
}

/**
 * Create expired access (set expires_at in the past)
 */
export async function createExpiredAccess(
  adminClient: ReturnType<typeof createAdminClient>,
  userId: string,
  propertyId: string
): Promise<void> {
  const { error } = await adminClient
    .from('property_stakeholders')
    .update({
      expires_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    })
    .eq('user_id', userId)
    .eq('property_id', propertyId);

  if (error) {
    throw error;
  }
}

