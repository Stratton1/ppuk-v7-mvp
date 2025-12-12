import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getRuntimeEnv } from '@/lib/env';
import type { Database } from '@/types/supabase';

const DEMO_PROPERTY_ID = '10000000-0000-0000-0000-000000000001';

const USERS = {
  owner: 'owner@ppuk.test',
  buyer: 'buyer@ppuk.test',
  agent: 'agent@ppuk.test',
  conveyancer: 'conveyancer@ppuk.test',
  admin: 'admin@ppuk.test',
  tenant: 'tenant@ppuk.test',
  surveyor: 'surveyor@ppuk.test',
};

const SEED_ACCOUNTS: Array<{
  email: string;
  password: string;
  full_name: string;
  primary_role: Database['public']['Enums']['user_primary_role'];
}> = [
  { email: USERS.owner, password: 'password123', full_name: 'Owner Test', primary_role: 'consumer' },
  { email: USERS.buyer, password: 'password123', full_name: 'Buyer Test', primary_role: 'consumer' },
  { email: USERS.agent, password: 'password123', full_name: 'Agent Test', primary_role: 'agent' },
  { email: USERS.conveyancer, password: 'password123', full_name: 'Conveyancer Test', primary_role: 'conveyancer' },
  { email: USERS.admin, password: 'password123', full_name: 'Admin Test', primary_role: 'admin' },
  { email: USERS.tenant, password: 'password123', full_name: 'Tenant Test', primary_role: 'consumer' },
  { email: USERS.surveyor, password: 'password123', full_name: 'Surveyor Test', primary_role: 'surveyor' },
];

function isAllowed(env: ReturnType<typeof getRuntimeEnv>) {
  const allowFlag = process.env.ALLOW_TEST_API === 'true';
  return env.NODE_ENV !== 'production' || allowFlag;
}

export async function POST() {
  const env = getRuntimeEnv();
  if (!isAllowed(env)) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  const supabase = createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const now = new Date().toISOString();

  try {
    const userMap: Record<string, string> = {};

    // Ensure seed auth users exist and are linked to public.users/profiles
    for (const account of SEED_ACCOUNTS) {
      let authId: string | undefined;

      const created = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
      });

      if (created.error) {
        // If user already exists, fallback to listUsers to find the id
        const list = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
        const existing = list.data?.users.find((u) => u.email === account.email);
        if (!existing) {
          return NextResponse.json(
            { ok: false, error: `Failed to ensure user ${account.email}: ${created.error.message}` },
            { status: 500 }
          );
        }
        authId = existing.id;
      } else {
        authId = created.data.user?.id;
      }

      if (!authId) {
        return NextResponse.json({ ok: false, error: `User id missing for ${account.email}` }, { status: 500 });
      }

      userMap[account.email] = authId;

      await supabase
        .from('users')
        .upsert(
          {
            id: authId,
            email: account.email,
            full_name: account.full_name,
            primary_role: account.primary_role,
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

    // Create a demo property
    const propertyPayload = {
      id: DEMO_PROPERTY_ID,
      display_address: 'Seeded Demo Property, 10 Example Road, London',
      public_slug: 'demo-property',
      public_visibility: true,
      uprn: 'UPRN-DEMO-100',
      status: 'active',
      created_by_user_id: userMap[USERS.owner],
      created_at: now,
      updated_at: now,
    } as Database['public']['Tables']['properties']['Insert'];

    await supabase.from('properties').upsert(propertyPayload, { onConflict: 'id' });

    // Stakeholders
    const stakeholders = [
      {
        property_id: DEMO_PROPERTY_ID,
        user_id: userMap[USERS.owner],
        role: 'owner',
        status: 'owner',
        permission: 'editor',
      },
      userMap[USERS.agent]
        ? {
            property_id: DEMO_PROPERTY_ID,
            user_id: userMap[USERS.agent],
            role: 'editor',
            status: 'buyer',
            permission: 'editor',
          }
        : null,
      userMap[USERS.conveyancer]
        ? {
            property_id: DEMO_PROPERTY_ID,
            user_id: userMap[USERS.conveyancer],
            role: 'editor',
            status: 'buyer',
            permission: 'editor',
          }
        : null,
      userMap[USERS.buyer]
        ? {
            property_id: DEMO_PROPERTY_ID,
            user_id: userMap[USERS.buyer],
            role: 'viewer',
            status: 'buyer',
            permission: 'viewer',
          }
        : null,
      userMap[USERS.tenant]
        ? {
            property_id: DEMO_PROPERTY_ID,
            user_id: userMap[USERS.tenant],
            role: 'viewer',
            status: 'tenant',
            permission: 'viewer',
          }
        : null,
    ].filter(Boolean) as Database['public']['Tables']['property_stakeholders']['Insert'][];

    if (stakeholders.length) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('property_stakeholders').upsert(stakeholders);
    }

    // Documents (UI-only metadata)
    const documents = [
      {
        id: '20000000-0000-0000-0000-000000000001',
        property_id: DEMO_PROPERTY_ID,
        uploaded_by_user_id: userMap[USERS.owner],
        title: 'EPC Certificate',
        document_type: 'environmental',
        storage_bucket: 'property-documents',
        storage_path: '',
        mime_type: 'application/pdf',
        size_bytes: 1024,
        status: 'active',
        created_at: now,
      },
      {
        id: '20000000-0000-0000-0000-000000000002',
        property_id: DEMO_PROPERTY_ID,
        uploaded_by_user_id: userMap[USERS.owner],
        title: 'Title Register',
        document_type: 'ownership',
        storage_bucket: 'property-documents',
        storage_path: '',
        mime_type: 'application/pdf',
        size_bytes: 2048,
        status: 'active',
        created_at: now,
      },
    ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('documents').upsert(documents, { onConflict: 'id' });

    // Media
    const media = [
      {
        id: '30000000-0000-0000-0000-000000000001',
        property_id: DEMO_PROPERTY_ID,
        uploaded_by_user_id: userMap[USERS.owner],
        storage_bucket: 'property-photos',
        storage_path: '',
        mime_type: 'image/jpeg',
        size_bytes: 12345,
        media_type: 'photo',
        status: 'active',
        created_at: now,
      },
      {
        id: '30000000-0000-0000-0000-000000000002',
        property_id: DEMO_PROPERTY_ID,
        uploaded_by_user_id: userMap[USERS.owner],
        storage_bucket: 'property-photos',
        storage_path: '',
        mime_type: 'image/jpeg',
        size_bytes: 22345,
        media_type: 'floorplan',
        status: 'active',
        created_at: now,
      },
    ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('media').upsert(media, { onConflict: 'id' });

    // Issues (property_flags)
    const flags = [
      {
        id: '40000000-0000-0000-0000-000000000001',
        property_id: DEMO_PROPERTY_ID,
        created_by_user_id: userMap[USERS.owner],
        flag_type: 'risk',
        severity: 'medium',
        status: 'open',
        description: 'Check boiler service history.',
        created_at: now,
      },
      {
        id: '40000000-0000-0000-0000-000000000002',
        property_id: DEMO_PROPERTY_ID,
        created_by_user_id: userMap[USERS.agent],
        flag_type: 'document',
        severity: 'high',
        status: 'resolved',
        description: 'Title updated by conveyancer.',
        created_at: now,
        resolved_at: now,
      },
    ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('property_flags').upsert(flags, { onConflict: 'id' });

    // Watchlist for buyer
    if (userMap[USERS.buyer]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('watchlist')
        .upsert({ property_id: DEMO_PROPERTY_ID, user_id: userMap[USERS.buyer], created_at: now });
    }

    // Invitations example
    if (userMap[USERS.agent]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('invitations').upsert(
        {
          id: '50000000-0000-0000-0000-000000000001',
          property_id: DEMO_PROPERTY_ID,
          email: USERS.buyer,
          status: 'pending',
          invited_by_user_id: userMap[USERS.agent],
          created_at: now,
        },
        { onConflict: 'id' }
      );
    }

    return NextResponse.json({
      ok: true,
      properties: 1,
      documents: documents.length,
      media: media.length,
      issues: flags.length,
      stakeholders: stakeholders.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
