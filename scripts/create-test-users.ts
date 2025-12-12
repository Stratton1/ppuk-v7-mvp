#!/usr/bin/env tsx
/**
 * Script to create test users for local development
 * Usage: npx tsx scripts/create-test-users.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load .env.local
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const TEST_USERS = [
  { email: 'owner@ppuk.test', password: 'password123', primary_role: 'consumer' as const },
  { email: 'buyer@ppuk.test', password: 'password123', primary_role: 'consumer' as const },
  { email: 'tenant@ppuk.test', password: 'password123', primary_role: 'consumer' as const },
  { email: 'agent@ppuk.test', password: 'password123', primary_role: 'agent' as const },
  { email: 'conveyancer@ppuk.test', password: 'password123', primary_role: 'conveyancer' as const },
  { email: 'surveyor@ppuk.test', password: 'password123', primary_role: 'surveyor' as const },
  { email: 'admin@ppuk.test', password: 'password123', primary_role: 'admin' as const },
];

async function createTestUsers() {
  console.log('🚀 Creating test users...\n');
  
  const userIds: Record<string, string> = {};

  for (const user of TEST_USERS) {
    try {
      // Check if user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existing = existingUsers?.users.find((u) => u.email === user.email);

      if (existing) {
        console.log(`⚠️  User ${user.email} already exists (ID: ${existing.id})`);
        userIds[user.email] = existing.id;
      } else {
        // Create auth user
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
        });

        if (authError) {
          console.error(`❌ Failed to create auth user ${user.email}:`, authError.message);
          continue;
        }

        if (!authUser.user) {
          console.error(`❌ No user returned for ${user.email}`);
          continue;
        }

        userIds[user.email] = authUser.user.id;
        console.log(`✅ Created auth user: ${user.email} (${authUser.user.id})`);
      }

      // Upsert into public.users
      const { error: userError } = await supabase
        .from('users')
        .upsert(
          {
            id: userIds[user.email],
            email: user.email,
            full_name: user.email.split('@')[0],
            primary_role: user.primary_role,
          },
          { onConflict: 'id' }
        );

      if (userError) {
        console.error(`❌ Failed to upsert public.users for ${user.email}:`, userError.message);
      } else {
        console.log(`✅ Upserted public.users: ${user.email} (${user.primary_role})`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${user.email}:`, error instanceof Error ? error.message : String(error));
    }
  }

  console.log('\n📋 User IDs:');
  console.log(JSON.stringify(userIds, null, 2));

  return userIds;
}

async function assignPropertyRoles(userIds: Record<string, string>) {
  const PROPERTY_ID = 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa'; // From seed.sql

  console.log('\n🔗 Assigning property-scoped roles...\n');

  // Owner: editor
  if (userIds['owner@ppuk.test']) {
    const { error } = await supabase.rpc('grant_property_role', {
      property_id: PROPERTY_ID,
      target_user_id: userIds['owner@ppuk.test'],
      status: 'owner',
      permission: 'editor',
      expires_at: null,
    });
    if (error) {
      console.error(`❌ Failed to grant owner role:`, error.message);
    } else {
      console.log(`✅ Granted owner role to owner@ppuk.test`);
    }
  }

  // Buyer: viewer
  if (userIds['buyer@ppuk.test']) {
    const { error } = await supabase.rpc('grant_property_role', {
      property_id: PROPERTY_ID,
      target_user_id: userIds['buyer@ppuk.test'],
      status: 'buyer',
      permission: 'viewer',
      expires_at: null,
    });
    if (error) {
      console.error(`❌ Failed to grant buyer role:`, error.message);
    } else {
      console.log(`✅ Granted buyer role to buyer@ppuk.test`);
    }
  }

  // Tenant: viewer
  if (userIds['tenant@ppuk.test']) {
    const { error } = await supabase.rpc('grant_property_role', {
      property_id: PROPERTY_ID,
      target_user_id: userIds['tenant@ppuk.test'],
      status: 'tenant',
      permission: 'viewer',
      expires_at: null,
    });
    if (error) {
      console.error(`❌ Failed to grant tenant role:`, error.message);
    } else {
      console.log(`✅ Granted tenant role to tenant@ppuk.test`);
    }
  }
}

async function main() {
  try {
    const userIds = await createTestUsers();
    await assignPropertyRoles(userIds);
    console.log('\n✅ All test users created successfully!');
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();

