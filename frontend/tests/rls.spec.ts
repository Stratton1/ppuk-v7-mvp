import { beforeAll, describe, expect, it } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_TEST_URL;
const serviceKey = process.env.SUPABASE_TEST_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_TEST_ANON_KEY;

if (!url || !serviceKey || !anonKey) {
  describe.skip('RLS (env missing)', () => {
    it('skipped', () => {});
  });
} else {
  const adminClient = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const anonClient = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let ownerToken: string;
  let editorToken: string;
  let viewerToken: string;
  let propertyId: string;

  beforeAll(async () => {
    // Create users
    const ownerEmail = `owner_${Date.now()}@test.local`;
    const editorEmail = `editor_${Date.now()}@test.local`;
    const viewerEmail = `viewer_${Date.now()}@test.local`;

    const createUser = async (email: string) => {
      const { data, error } = await adminClient.auth.admin.createUser({
        email,
        password: 'Password123!',
        email_confirm: true,
      });
      if (error || !data.user) throw error || new Error('user create failed');
      await adminClient.from('users').upsert({
        id: data.user.id,
        email,
        full_name: email,
        primary_role: 'consumer',
      });
      return data.user.id;
    };

    await createUser(ownerEmail);
    const editorId = await createUser(editorEmail);
    const viewerId = await createUser(viewerEmail);

    const signIn = async (email: string) => {
      const { data, error } = await anonClient.auth.signInWithPassword({
        email,
        password: 'Password123!',
      });
      if (error || !data.session) throw error || new Error('signin failed');
      return data.session.access_token;
    };

    ownerToken = await signIn(ownerEmail);
    editorToken = await signIn(editorEmail);
    viewerToken = await signIn(viewerEmail);

    // Owner creates property via RPC
    const ownerClient = createClient(url, anonKey, { global: { headers: { Authorization: `Bearer ${ownerToken}` } } });
    const { data: newProperty, error: createError } = await ownerClient.rpc('create_property_with_role', {
      p_uprn: `UPRN-${Date.now()}`,
      p_display_address: 'Test Address',
      p_latitude: null,
      p_longitude: null,
      p_status: 'draft',
    });
    if (createError || !newProperty) throw createError || new Error('property create failed');
    propertyId = newProperty as string;

    // Grant editor and viewer roles
    await ownerClient.rpc('grant_property_role', {
      target_user_id: editorId,
      property_id: propertyId,
      permission: 'editor',
    });
    await ownerClient.rpc('grant_property_role', {
      target_user_id: viewerId,
      property_id: propertyId,
      permission: 'viewer',
    });
  }, 60000);

  describe('RLS permissions', () => {
    it(
      'allows viewer to read property but not update',
      async () => {
        const viewerClient = createClient(url, anonKey, {
          global: { headers: { Authorization: `Bearer ${viewerToken}` } },
        });

        const { data: props, error: readError } = await viewerClient
          .from('properties')
          .select('id')
          .eq('id', propertyId)
          .maybeSingle();
        expect(readError).toBeNull();
        expect(props?.id).toBe(propertyId);

        const { error: updateError } = await viewerClient
          .from('properties')
          .update({ status: 'active' })
          .eq('id', propertyId);
        expect(updateError).not.toBeNull();
      },
      30000
    );

    it(
      'allows editor to insert documents',
      async () => {
        const editorClient = createClient(url, anonKey, {
          global: { headers: { Authorization: `Bearer ${editorToken}` } },
        });
        const { data: editorUser } = await editorClient.auth.getUser();
        const editorUserId = editorUser.user?.id;
        if (!editorUserId) throw new Error('editor user missing');
        const { error } = await editorClient.from('documents').insert({
          property_id: propertyId,
          uploaded_by_user_id: editorUserId,
          title: 'Test Doc',
          document_type: 'other',
          storage_bucket: 'property-documents',
          storage_path: `test/${Date.now()}.pdf`,
          mime_type: 'application/pdf',
          size_bytes: 1,
          status: 'active',
        });
        expect(error).toBeNull();
      },
      30000
    );

    it(
      'allows owner to set public visibility and prevents viewer write',
      async () => {
        const ownerClient = createClient(url, anonKey, {
          global: { headers: { Authorization: `Bearer ${ownerToken}` } },
        });
        const { error: visError } = await ownerClient.rpc('set_public_visibility', {
          property_id: propertyId,
          visible: true,
        });
        expect(visError).toBeNull();

        const viewerClient = createClient(url, anonKey, {
          global: { headers: { Authorization: `Bearer ${viewerToken}` } },
        });
        const { data: viewerUser } = await viewerClient.auth.getUser();
        const viewerUserId = viewerUser.user?.id;
        if (!viewerUserId) throw new Error('viewer user missing');
        const { error: failUpdate } = await viewerClient
          .from('documents')
          .insert({
            property_id: propertyId,
            uploaded_by_user_id: viewerUserId,
            title: 'Should fail',
            document_type: 'other',
            storage_bucket: 'property-documents',
            storage_path: `test/${Date.now()}-viewer.pdf`,
            mime_type: 'application/pdf',
            size_bytes: 1,
            status: 'active',
          });
        expect(failUpdate).not.toBeNull();
      },
      30000
    );
  });
}
