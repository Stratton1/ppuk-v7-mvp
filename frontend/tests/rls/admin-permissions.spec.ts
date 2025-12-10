/**
 * File: admin-permissions.spec.ts
 * Purpose: Test RLS policies for admin users (bypass RLS)
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
  describe.skip('Admin Permissions (env missing)', () => {
    it('skipped', () => {});
  });
} else {
  let owner: TestUser;
  let admin: TestUser;
  let property: TestProperty;
  const adminClient = createAdminClient();

  beforeAll(async () => {
    const ownerData = await createTestUser(
      adminClient,
      `owner_${Date.now()}@test.local`,
      'consumer'
    );
    owner = await signInUser(ownerData.email);

    const adminData = await createTestUser(
      adminClient,
      `admin_${Date.now()}@test.local`,
      'admin'
    );
    admin = await signInUser(adminData.email);

    property = await createTestProperty(owner.client);
  }, 60000);

  describe('Admin Permissions', () => {
    it('admin can view any property', async () => {
      const { data, error } = await admin.client
        .from('properties')
        .select('id, display_address')
        .eq('id', property.id)
        .maybeSingle();

      expect(error).toBeNull();
      expect(data?.id).toBe(property.id);
    });

    it('admin can edit any property', async () => {
      const { error } = await admin.client
        .from('properties')
        .update({ status: 'active' })
        .eq('id', property.id);

      expect(error).toBeNull();
    });

    it('admin can view all documents', async () => {
      const { data: user } = await owner.client.auth.getUser();
      const { data: doc } = await owner.client.from('documents').insert({
        property_id: property.id,
        uploaded_by_user_id: user.user!.id,
        title: 'Owner Document',
        document_type: 'other',
        storage_bucket: 'property-documents',
        storage_path: `test/${Date.now()}.pdf`,
        mime_type: 'application/pdf',
        size_bytes: 1024,
        status: 'active',
      }).select().single();

      if (doc) {
        const { data: adminDoc, error } = await admin.client
          .from('documents')
          .select('id')
          .eq('id', doc.id)
          .maybeSingle();

        expect(error).toBeNull();
        expect(adminDoc?.id).toBe(doc.id);
      }
    });

    it('admin can view all users', async () => {
      const { data, error } = await admin.client
        .from('users')
        .select('id, email')
        .eq('id', owner.id)
        .maybeSingle();

      expect(error).toBeNull();
      expect(data?.id).toBe(owner.id);
    });
  });
}

