/**
 * File: viewer-vs-editor.spec.ts
 * Purpose: Test permission level differences between viewer and editor
 */

import { beforeAll, describe, expect, it } from 'vitest';
import {
  createAdminClient,
  createTestUser,
  signInUser,
  createTestProperty,
  grantPropertyRole,
  type TestUser,
  type TestProperty,
} from '../helpers/rls-test-helpers';

const url = process.env.SUPABASE_TEST_URL;
const serviceKey = process.env.SUPABASE_TEST_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_TEST_ANON_KEY;

if (!url || !serviceKey || !anonKey) {
  describe.skip('Viewer vs Editor (env missing)', () => {
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

    // Grant roles
    await grantPropertyRole(owner.client, viewer.id, property.id, null, 'viewer');
    await grantPropertyRole(owner.client, editor.id, property.id, null, 'editor');
  }, 60000);

  describe('Viewer vs Editor Permissions', () => {
    it('viewer can read property but not edit', async () => {
      const { data, error: readError } = await viewer.client
        .from('properties')
        .select('id')
        .eq('id', property.id)
        .maybeSingle();

      expect(readError).toBeNull();
      expect(data?.id).toBe(property.id);

      const { error: updateError } = await viewer.client
        .from('properties')
        .update({ status: 'active' })
        .eq('id', property.id);

      expect(updateError).not.toBeNull();
    });

    it('editor can read and edit property', async () => {
      const { data, error: readError } = await editor.client
        .from('properties')
        .select('id')
        .eq('id', property.id)
        .maybeSingle();

      expect(readError).toBeNull();
      expect(data?.id).toBe(property.id);

      const { error: updateError } = await editor.client
        .from('properties')
        .update({ status: 'active' })
        .eq('id', property.id);

      expect(updateError).toBeNull();
    });

    it('viewer cannot upload documents', async () => {
      const { data: user } = await viewer.client.auth.getUser();
      const { error } = await viewer.client.from('documents').insert({
        property_id: property.id,
        uploaded_by_user_id: user.user!.id,
        title: 'Viewer Document',
        document_type: 'other',
        storage_bucket: 'property-documents',
        storage_path: `test/${Date.now()}.pdf`,
        mime_type: 'application/pdf',
        size_bytes: 1024,
        status: 'active',
      });

      expect(error).not.toBeNull();
    });

    it('editor can upload documents', async () => {
      const { data: user } = await editor.client.auth.getUser();
      const { error } = await editor.client.from('documents').insert({
        property_id: property.id,
        uploaded_by_user_id: user.user!.id,
        title: 'Editor Document',
        document_type: 'other',
        storage_bucket: 'property-documents',
        storage_path: `test/${Date.now()}.pdf`,
        mime_type: 'application/pdf',
        size_bytes: 1024,
        status: 'active',
      });

      expect(error).toBeNull();
    });

    it('viewer cannot create tasks', async () => {
      const { data: user } = await viewer.client.auth.getUser();
      const { error } = await viewer.client.from('tasks').insert({
        property_id: property.id,
        title: 'Viewer Task',
        description: 'Should fail',
        status: 'open',
        priority: 'medium',
        created_by_user_id: user.user!.id,
      });

      expect(error).not.toBeNull();
    });

    it('editor can create tasks', async () => {
      const { data: user } = await editor.client.auth.getUser();
      const { error } = await editor.client.from('tasks').insert({
        property_id: property.id,
        title: 'Editor Task',
        description: 'Should succeed',
        status: 'open',
        priority: 'medium',
        created_by_user_id: user.user!.id,
      });

      expect(error).toBeNull();
    });

    it('viewer cannot grant roles', async () => {
      const newUserData = await createTestUser(
        adminClient,
        `newuser_${Date.now()}@test.local`,
        'consumer'
      );

      const { error } = await viewer.client.rpc('grant_property_role', {
        target_user_id: newUserData.id,
        property_id: property.id,
        property_status: null,
        property_permission: 'viewer',
      });

      expect(error).not.toBeNull();
    });

    it('editor cannot grant roles (only owner)', async () => {
      const newUserData = await createTestUser(
        adminClient,
        `newuser2_${Date.now()}@test.local`,
        'consumer'
      );

      const { error } = await editor.client.rpc('grant_property_role', {
        target_user_id: newUserData.id,
        property_id: property.id,
        property_status: null,
        property_permission: 'viewer',
      });

      expect(error).not.toBeNull();
    });
  });
}

