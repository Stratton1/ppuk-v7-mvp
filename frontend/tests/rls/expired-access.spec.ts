/**
 * File: expired-access.spec.ts
 * Purpose: Test expired access scenarios
 */

import { beforeAll, describe, expect, it } from 'vitest';
import {
  createAdminClient,
  createTestUser,
  signInUser,
  createTestProperty,
  grantPropertyRole,
  createExpiredAccess,
  type TestUser,
  type TestProperty,
} from '../helpers/rls-test-helpers';

const url = process.env.SUPABASE_TEST_URL;
const serviceKey = process.env.SUPABASE_TEST_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_TEST_ANON_KEY;

if (!url || !serviceKey || !anonKey) {
  describe.skip('Expired Access (env missing)', () => {
    it('skipped', () => {});
  });
} else {
  let owner: TestUser;
  let viewer: TestUser;
  let editor: TestUser;
  let property: TestProperty;
  const adminClient = createAdminClient();

  beforeAll(async () => {
    // Create users
    const ownerData = await createTestUser(
      adminClient,
      `owner_${Date.now()}@test.local`,
      'consumer'
    );
    owner = await signInUser(ownerData.email);

    const viewerData = await createTestUser(
      adminClient,
      `viewer_${Date.now()}@test.local`,
      'consumer'
    );
    viewer = await signInUser(viewerData.email);

    const editorData = await createTestUser(
      adminClient,
      `editor_${Date.now()}@test.local`,
      'consumer'
    );
    editor = await signInUser(editorData.email);

    // Create property
    property = await createTestProperty(owner.client);

    // Grant roles with future expiry
    await grantPropertyRole(owner.client, viewer.id, property.id, null, 'viewer');
    await grantPropertyRole(owner.client, editor.id, property.id, null, 'editor');

    // Set expiry to past
    await createExpiredAccess(adminClient, viewer.id, property.id);
    await createExpiredAccess(adminClient, editor.id, property.id);
  }, 60000);

  describe('Expired Access', () => {
    it('viewer cannot access property after expires_at', async () => {
      const { data } = await viewer.client
        .from('properties')
        .select('id')
        .eq('id', property.id)
        .maybeSingle();

      // Should not be able to access expired property
      expect(data).toBeNull();
    });

    it('editor cannot access property after expires_at', async () => {
      const { data } = await editor.client
        .from('properties')
        .select('id')
        .eq('id', property.id)
        .maybeSingle();

      // Should not be able to access expired property
      expect(data).toBeNull();
    });

    it('expired access does not affect owners', async () => {
      const { data, error } = await owner.client
        .from('properties')
        .select('id')
        .eq('id', property.id)
        .maybeSingle();

      expect(error).toBeNull();
      expect(data?.id).toBe(property.id);
    });

    it('expired viewer cannot upload documents', async () => {
      const { data: user } = await viewer.client.auth.getUser();
      const { error } = await viewer.client.from('documents').insert({
        property_id: property.id,
        uploaded_by_user_id: user.user!.id,
        title: 'Expired Viewer Doc',
        document_type: 'other',
        storage_bucket: 'property-documents',
        storage_path: `test/${Date.now()}.pdf`,
        mime_type: 'application/pdf',
        size_bytes: 1024,
        status: 'active',
      });

      expect(error).not.toBeNull();
    });
  });
}

