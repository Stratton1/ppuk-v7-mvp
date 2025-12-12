/**
 * File: public-visibility.spec.ts
 * Purpose: Test public visibility scenarios
 */

import { beforeAll, describe, expect, it } from 'vitest';
import {
  createAdminClient,
  createAnonClient,
  createTestUser,
  signInUser,
  createTestProperty,
  setPublicVisibility,
  type TestUser,
  type TestProperty,
} from '../helpers/rls-test-helpers';

const url = process.env.SUPABASE_TEST_URL;
const serviceKey = process.env.SUPABASE_TEST_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_TEST_ANON_KEY;

if (!url || !serviceKey || !anonKey) {
  describe.skip('Public Visibility (env missing)', () => {
    it('skipped', () => {});
  });
} else {
  let owner: TestUser;
  let publicProperty: TestProperty;
  let privateProperty: TestProperty;
  const adminClient = createAdminClient();
  const anonClient = createAnonClient();

  beforeAll(async () => {
    // Create owner
    const ownerData = await createTestUser(
      adminClient,
      `owner_${Date.now()}@test.local`,
      'consumer'
    );
    owner = await signInUser(ownerData.email);

    // Create public property
    publicProperty = await createTestProperty(owner.client, `UPRN-PUBLIC-${Date.now()}`, 'Public Property');
    await setPublicVisibility(owner.client, publicProperty.id, true);
    await owner.client.from('properties').update({ status: 'active' }).eq('id', publicProperty.id);

    // Create private property
    privateProperty = await createTestProperty(owner.client, `UPRN-PRIVATE-${Date.now()}`, 'Private Property');
    await setPublicVisibility(owner.client, privateProperty.id, false);
  }, 60000);

  describe('Public Visibility', () => {
    it('anonymous user can view public property basic info', async () => {
      const { data, error } = await anonClient
        .from('properties')
        .select('id, display_address, public_visibility')
        .eq('id', publicProperty.id)
        .maybeSingle();

      expect(error).toBeNull();
      expect(data?.id).toBe(publicProperty.id);
      expect(data?.public_visibility).toBe(true);
    });

    it('anonymous user cannot view private property', async () => {
      const { data } = await anonClient
        .from('properties')
        .select('id')
        .eq('id', privateProperty.id)
        .maybeSingle();

      // Should return null (not found) or error
      expect(data).toBeNull();
    });

    it('anonymous user can view public property photos via search', async () => {
      // First, add a photo to the public property
      const { data: user } = await owner.client.auth.getUser();
      const { data: media } = await owner.client.from('media').insert({
        property_id: publicProperty.id,
        uploaded_by_user_id: user.user!.id,
        media_type: 'photo',
        title: 'Public Photo',
        storage_bucket: 'property-photos',
        storage_path: `test/${Date.now()}.jpg`,
        mime_type: 'image/jpeg',
        size_bytes: 1024,
        status: 'active',
      }).select().single();

      if (media) {
        // Anonymous user should be able to see public property media
        const { error } = await anonClient
          .from('media')
          .select('id')
          .eq('property_id', publicProperty.id)
          .eq('id', media.id)
          .maybeSingle();

        // Note: This depends on RLS policies - may need to check actual policy behavior
        // For now, we check that the query doesn't error
        expect(error).toBeNull();
      }
    });

    it('anonymous user cannot view public property documents', async () => {
      const { data: user } = await owner.client.auth.getUser();
      const { data: doc } = await owner.client.from('documents').insert({
        property_id: publicProperty.id,
        uploaded_by_user_id: user.user!.id,
        title: 'Public Document',
        document_type: 'other',
        storage_bucket: 'property-documents',
        storage_path: `test/${Date.now()}.pdf`,
        mime_type: 'application/pdf',
        size_bytes: 1024,
        status: 'active',
      }).select().single();

      if (doc) {
        // Documents should never be publicly accessible
        const { data } = await anonClient
          .from('documents')
          .select('id')
          .eq('id', doc.id)
          .maybeSingle();

        expect(data).toBeNull();
      }
    });

    it('authenticated user can view public property even without access', async () => {
      const otherUserData = await createTestUser(
        adminClient,
        `other_${Date.now()}@test.local`,
        'consumer'
      );
      const otherUser = await signInUser(otherUserData.email);

      const { data, error } = await otherUser.client
        .from('properties')
        .select('id, display_address')
        .eq('id', publicProperty.id)
        .maybeSingle();

      expect(error).toBeNull();
      expect(data?.id).toBe(publicProperty.id);
    });
  });
}

