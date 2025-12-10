/**
 * File: buyer-permissions.spec.ts
 * Purpose: Test RLS policies for buyers (property_status_type = 'buyer')
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
  describe.skip('Buyer Permissions (env missing)', () => {
    it('skipped', () => {});
  });
} else {
  let owner: TestUser;
  let buyer: TestUser;
  let property: TestProperty;
  const adminClient = createAdminClient();

  beforeAll(async () => {
    const ownerData = await createTestUser(
      adminClient,
      `owner_${Date.now()}@test.local`,
      'consumer'
    );
    owner = await signInUser(ownerData.email);

    const buyerData = await createTestUser(
      adminClient,
      `buyer_${Date.now()}@test.local`,
      'consumer'
    );
    buyer = await signInUser(buyerData.email);

    property = await createTestProperty(owner.client);
    await grantPropertyRole(owner.client, buyer.id, property.id, 'buyer', 'viewer');
  }, 60000);

  describe('Buyer Permissions', () => {
    it('buyer can view shared property', async () => {
      const { data, error } = await buyer.client
        .from('properties')
        .select('id, display_address')
        .eq('id', property.id)
        .maybeSingle();

      expect(error).toBeNull();
      expect(data?.id).toBe(property.id);
    });

    it('buyer with viewer permission cannot edit property', async () => {
      const { error } = await buyer.client
        .from('properties')
        .update({ status: 'active' })
        .eq('id', property.id);

      expect(error).not.toBeNull();
    });

    it('buyer with viewer permission cannot upload documents', async () => {
      const { data: user } = await buyer.client.auth.getUser();
      const { error } = await buyer.client.from('documents').insert({
        property_id: property.id,
        uploaded_by_user_id: user.user!.id,
        title: 'Buyer Document',
        document_type: 'other',
        storage_bucket: 'property-documents',
        storage_path: `test/${Date.now()}.pdf`,
        mime_type: 'application/pdf',
        size_bytes: 1024,
        status: 'active',
      });

      expect(error).not.toBeNull();
    });

    it('buyer with editor permission can upload documents', async () => {
      // Grant editor permission to buyer
      await grantPropertyRole(owner.client, buyer.id, property.id, 'buyer', 'editor');

      const { data: user } = await buyer.client.auth.getUser();
      const { error } = await buyer.client.from('documents').insert({
        property_id: property.id,
        uploaded_by_user_id: user.user!.id,
        title: 'Buyer Editor Document',
        document_type: 'other',
        storage_bucket: 'property-documents',
        storage_path: `test/${Date.now()}.pdf`,
        mime_type: 'application/pdf',
        size_bytes: 1024,
        status: 'active',
      });

      expect(error).toBeNull();
    });
  });
}

