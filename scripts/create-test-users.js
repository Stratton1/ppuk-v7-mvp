#!/usr/bin/env node
/**
 * Script to create test users for local development
 * Usage: node scripts/create-test-users.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
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
  { email: 'owner@test.local', password: 'Test123!', primary_role: 'consumer' },
  { email: 'buyer@test.local', password: 'Test123!', primary_role: 'consumer' },
  { email: 'tenant@test.local', password: 'Test123!', primary_role: 'consumer' },
  { email: 'agent@test.local', password: 'Test123!', primary_role: 'agent' },
  { email: 'conveyancer@test.local', password: 'Test123!', primary_role: 'conveyancer' },
  { email: 'surveyor@test.local', password: 'Test123!', primary_role: 'surveyor' },
  { email: 'admin@test.local', password: 'Admin123!', primary_role: 'admin' },
];

async function createTestUsers() {
  console.log('🚀 Creating test users...\n');
  
  const userIds = {};

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
      console.error(`❌ Error processing ${user.email}:`, error.message);
    }
  }

  console.log('\n📋 User IDs:');
  console.log(JSON.stringify(userIds, null, 2));

  return userIds;
}

async function assignPropertyRoles(userIds) {
  const PROPERTY_ID = 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa'; // From seed.sql

  console.log('\n🔗 Assigning property-scoped roles...\n');

  // Owner: editor
  if (userIds['owner@test.local']) {
    const { error } = await supabase.rpc('grant_property_role', {
      property_id: PROPERTY_ID,
      target_user_id: userIds['owner@test.local'],
      status: 'owner',
      permission: 'editor',
      expires_at: null,
    });
    if (error) {
      console.error(`❌ Failed to grant owner role:`, error.message);
    } else {
      console.log(`✅ Granted owner role to owner@test.local`);
    }
  }

  // Buyer: viewer
  if (userIds['buyer@test.local']) {
    const { error } = await supabase.rpc('grant_property_role', {
      property_id: PROPERTY_ID,
      target_user_id: userIds['buyer@test.local'],
      status: 'buyer',
      permission: 'viewer',
      expires_at: null,
    });
    if (error) {
      console.error(`❌ Failed to grant buyer role:`, error.message);
    } else {
      console.log(`✅ Granted buyer role to buyer@test.local`);
    }
  }

  // Tenant: viewer
  if (userIds['tenant@test.local']) {
    const { error } = await supabase.rpc('grant_property_role', {
      property_id: PROPERTY_ID,
      target_user_id: userIds['tenant@test.local'],
      status: 'tenant',
      permission: 'viewer',
      expires_at: null,
    });
    if (error) {
      console.error(`❌ Failed to grant tenant role:`, error.message);
    } else {
      console.log(`✅ Granted tenant role to tenant@test.local`);
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

