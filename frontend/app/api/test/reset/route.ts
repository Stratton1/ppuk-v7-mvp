import { NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getRuntimeEnv } from '@/lib/env';
import type { Database } from '@/types/supabase';

type SeedUser = {
  id: string;
  email: string;
  password: string;
  full_name: string;
  primary_role: Database['public']['Enums']['user_primary_role'];
  stakeholder?: {
    role: Database['public']['Enums']['property_role_type'];
    status: Database['public']['Enums']['property_status_type'] | null;
    permission: Database['public']['Enums']['property_permission_type'] | null;
  };
};

type SupabaseDbClient = SupabaseClient<Database>;

const SEED_USERS: SeedUser[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'owner@ppuk.test',
    password: 'password123',
    full_name: 'Owner Test',
    primary_role: 'consumer',
    stakeholder: { role: 'owner', status: 'owner', permission: 'editor' },
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'buyer@ppuk.test',
    password: 'password123',
    full_name: 'Buyer Test',
    primary_role: 'consumer',
    stakeholder: { role: 'viewer', status: 'buyer', permission: 'viewer' },
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'agent@ppuk.test',
    password: 'password123',
    full_name: 'Agent Test',
    primary_role: 'agent',
    stakeholder: { role: 'editor', status: 'buyer', permission: 'editor' },
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    email: 'conveyancer@ppuk.test',
    password: 'password123',
    full_name: 'Conveyancer Test',
    primary_role: 'conveyancer',
    stakeholder: { role: 'editor', status: 'buyer', permission: 'editor' },
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    email: 'surveyor@ppuk.test',
    password: 'password123',
    full_name: 'Surveyor Test',
    primary_role: 'surveyor',
    stakeholder: { role: 'editor', status: 'buyer', permission: 'editor' },
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    email: 'admin@ppuk.test',
    password: 'password123',
    full_name: 'Admin Test',
    primary_role: 'admin',
  },
  {
    id: '00000000-0000-0000-0000-000000000007',
    email: 'tenant@ppuk.test',
    password: 'password123',
    full_name: 'Tenant Test',
    primary_role: 'consumer',
    stakeholder: { role: 'viewer', status: 'tenant', permission: 'viewer' },
  },
];

const DEMO_PROPERTY_ID = '00000000-0000-0000-0000-000000009999';
const DEMO_PROPERTY_SLUG = 'example-slug';
const DEMO_UPRN = 'UPRN-DEMO-001';
const MATCH_NONE_UUID = '00000000-0000-0000-0000-000000000000';

const TABLES_IN_ORDER: Array<{ name: keyof Database['public']['Tables']; column: string }> = [
  { name: 'property_events', column: 'id' },
  { name: 'property_metadata', column: 'id' },
  { name: 'documents', column: 'id' }, // property_documents equivalent
  { name: 'media', column: 'id' }, // property_media equivalent
  { name: 'tasks', column: 'id' },
  { name: 'property_stakeholders', column: 'property_id' },
  { name: 'invitations', column: 'id' },
  { name: 'properties', column: 'id' },
  { name: 'profiles', column: 'user_id' },
  { name: 'users', column: 'id' },
];

function isAllowed(env: ReturnType<typeof getRuntimeEnv>) {
  const allowFlag = process.env.ALLOW_TEST_API === 'true';
  return env.NODE_ENV !== 'production' || allowFlag;
}

async function clearTables(supabase: SupabaseDbClient, serviceRoleUserId?: string) {
  for (const table of TABLES_IN_ORDER) {
    let query = supabase.from(table.name).delete();
    if (table.name === 'users' && serviceRoleUserId) {
      query = query.neq(table.column, MATCH_NONE_UUID).neq(table.column, serviceRoleUserId);
    } else if (table.name === 'profiles' && serviceRoleUserId) {
      query = query.neq(table.column, MATCH_NONE_UUID).neq(table.column, serviceRoleUserId);
    } else {
      query = query.neq(table.column, MATCH_NONE_UUID);
    }

    const { error } = await query;
    if (error) {
      throw new Error(`Failed to clear ${table.name}: ${error.message}`);
    }
  }
}

async function deleteSeedAuthUsers(
  supabase: SupabaseDbClient,
  seedUsers: SeedUser[],
  serviceRoleUserId?: string
) {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) {
    throw new Error(`Failed to list auth users: ${error.message}`);
  }

  const seedEmails = new Set(seedUsers.map((u) => u.email));
  const seedIds = new Set(seedUsers.map((u) => u.id));

  for (const user of data?.users ?? []) {
    if (serviceRoleUserId && user.id === serviceRoleUserId) continue;
    if (!seedEmails.has(user.email ?? '') && !seedIds.has(user.id)) continue;

    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    if (deleteError && deleteError.message !== 'User not found') {
      throw new Error(`Failed to delete auth user ${user.id}: ${deleteError.message}`);
    }
  }
}

async function createSeedAuthUsers(
  supabase: SupabaseDbClient,
  seedUsers: SeedUser[],
  now: string
): Promise<Record<string, string>> {
  const userMap: Record<string, string> = {};

  for (const user of seedUsers) {
    const createPayload = {
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { seed: true },
      app_metadata: { provider: 'email' },
      id: user.id,
    };

    const created = await supabase.auth.admin.createUser(createPayload as any);
    if (created.error) {
      const list = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const existing = list.data?.users.find((u) => u.email === user.email);
      if (!existing) {
        throw new Error(`Failed to create auth user ${user.email}: ${created.error.message}`);
      }
      userMap[user.email] = existing.id;
    } else {
      userMap[user.email] = created.data.user?.id ?? user.id;
    }

    const authId = userMap[user.email];

    await supabase
      .from('users')
      .upsert(
        {
          id: authId,
          email: user.email,
          full_name: user.full_name,
          primary_role: user.primary_role,
          created_at: now,
          updated_at: now,
        },
        { onConflict: 'id' }
      )
      .throwOnError();

    await supabase
      .from('profiles')
      .upsert(
        {
          user_id: authId,
          phone: null,
          bio: null,
          created_at: now,
          updated_at: now,
        },
        { onConflict: 'user_id' }
      )
      .throwOnError();
  }

  return userMap;
}

export async function POST() {
  const env = getRuntimeEnv();
  if (!isAllowed(env)) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  const supabase = createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const now = new Date().toISOString();
  const serviceRoleUserId = process.env.SUPABASE_SERVICE_ROLE_USER_ID;

  try {
    await deleteSeedAuthUsers(supabase, SEED_USERS, serviceRoleUserId);
    await clearTables(supabase, serviceRoleUserId);
    const userMap = await createSeedAuthUsers(supabase, SEED_USERS, now);

    const baseProperty = {
      id: DEMO_PROPERTY_ID,
      display_address: 'Example House, 123 Demo Street, London, SW1A 1AA',
      public_visibility: true,
      public_slug: DEMO_PROPERTY_SLUG,
      uprn: DEMO_UPRN,
      created_by_user_id: userMap['owner@ppuk.test'],
      status: 'active' as Database['public']['Enums']['property_status_type'],
      created_at: now,
      updated_at: now,
    };

    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .upsert(baseProperty, { onConflict: 'id' })
      .select()
      .maybeSingle();

    if (propertyError || !property) {
      return NextResponse.json(
        { error: propertyError?.message ?? 'Failed to seed property' },
        { status: 500 }
      );
    }

    const stakeholderRows =
      SEED_USERS.filter((u) => u.stakeholder).map((u) => ({
        property_id: property.id,
        user_id: userMap[u.email],
        role: u.stakeholder!.role,
        status: u.stakeholder!.status,
        permission: u.stakeholder!.permission,
        granted_at: now,
        created_at: now,
        updated_at: now,
      })) ?? [];

    if (stakeholderRows.length) {
      const { error: deleteError } = await supabase.from('property_stakeholders').delete().eq('property_id', property.id);
      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }
      const { error: stakeholderError } = await supabase.from('property_stakeholders').insert(stakeholderRows);
      if (stakeholderError) {
        return NextResponse.json({ error: stakeholderError.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      ok: true,
      property,
      users: SEED_USERS.map((u) => ({ email: u.email, id: userMap[u.email], role: u.primary_role })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
