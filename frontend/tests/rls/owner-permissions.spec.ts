/**
 * File: owner-permissions.spec.ts
 * Purpose: Test RLS policies for property owners
 */

import { beforeAll, describe, expect, it } from 'vitest';
import {
  createAdminClient,
  createTestUser,
  signInUser,
  createTestProperty,
  type TestUser,
  type TestProperty,
} from '../helpers/rls-test-helpers';

const url = process.env.SUPABASE_TEST_URL;
const serviceKey = process.env.SUPABASE_TEST_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_TEST_ANON_KEY;

if (!url || !serviceKey || !anonKey) {
  describe.skip('Owner Permissions (env missing)', () => {
    it('skipped', () => {});
  });
} else {
  let owner: TestUser;
  let property: TestProperty;
  const adminClient = createAdminClient();

  beforeAll(async () => {
    // Create owner user
    const ownerData = await createTestUser(
      adminClient,
      `owner_${Date.now()}@test.local`,
      'consumer'
    );
    owner = await signInUser(ownerData.email);

    // Create property
    property = await createTestProperty(owner.client);
  }, 60000);

  describe('Owner Permissions', () => {
    it('can view own property', async () => {
      const { data, error } = await owner.client
        .from('properties')
        .select('id, display_address')
        .eq('id', property.id)
        .maybeSingle();

      expect(error).toBeNull();
      expect(data?.id).toBe(property.id);
    });

    it('can edit own property', async () => {
      const { error } = await owner.client
        .from('properties')
        .update({ status: 'active' })
        .eq('id', property.id);

      expect(error).toBeNull();
    });

    it('can upload documents to own property', async () => {
      const { data: user } = await owner.client.auth.getUser();
      const { error } = await owner.client.from('documents').insert({
        property_id: property.id,
        uploaded_by_user_id: user.user!.id,
        title: 'Owner Document',
        document_type: 'other',
        storage_bucket: 'property-documents',
        storage_path: `test/${Date.now()}.pdf`,
        mime_type: 'application/pdf',
        size_bytes: 1024,
        status: 'active',
      });

      expect(error).toBeNull();
    });

    it('can delete documents from own property', async () => {
      const { data: user } = await owner.client.auth.getUser();
      const { data: doc } = await owner.client.from('documents').insert({
        property_id: property.id,
        uploaded_by_user_id: user.user!.id,
        title: 'Document to Delete',
        document_type: 'other',
        storage_bucket: 'property-documents',
        storage_path: `test/${Date.now()}-delete.pdf`,
        mime_type: 'application/pdf',
        size_bytes: 1024,
        status: 'active',
      }).select().single();

      if (doc) {
        const { error } = await owner.client
          .from('documents')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', doc.id);

        expect(error).toBeNull();
      }
    });

    it('can grant roles to other users', async () => {
      const viewerData = await createTestUser(
        adminClient,
        `viewer_${Date.now()}@test.local`,
        'consumer'
      );

      const { error } = await owner.client.rpc('grant_property_role', {
        target_user_id: viewerData.id,
        property_id: property.id,
        property_status: null,
        property_permission: 'viewer',
      });

      expect(error).toBeNull();
    });

    it('can set public visibility', async () => {
      const { error } = await owner.client.rpc('set_public_visibility', {
        property_id: property.id,
        visible: true,
      });

      expect(error).toBeNull();
    });

    it('can create tasks for own property', async () => {
      const { data: user } = await owner.client.auth.getUser();
      const { error } = await owner.client.from('tasks').insert({
        property_id: property.id,
        title: 'Owner Task',
        description: 'Test task',
        status: 'open',
        priority: 'medium',
        created_by_user_id: user.user!.id,
      });

      expect(error).toBeNull();
    });
  });
}

