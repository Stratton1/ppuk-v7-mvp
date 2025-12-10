/**
 * File: set-visibility.spec.ts
 * Purpose: Integration tests for setPublicVisibility server action
 */

import { describe, expect, it, beforeAll } from 'vitest';
import {
  createAdminClient,
  createAnonClient,
  createTestUser,
  signInUser,
  createTestProperty,
  grantPropertyRole,
  setPublicVisibility,
  type TestUser,
  type TestProperty,
} from '../helpers/rls-test-helpers';

const url = process.env.SUPABASE_TEST_URL;
const serviceKey = process.env.SUPABASE_TEST_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_TEST_ANON_KEY;

if (!url || !serviceKey || !anonKey) {
  describe.skip('Set Visibility Integration (env missing)', () => {
    it('skipped', () => {});
  });
} else {
  let owner: TestUser;
  let viewer: TestUser;
  let property: TestProperty;
  const adminClient = createAdminClient();
  const anonClient = createAnonClient();

  beforeAll(async () => {
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

    property = await createTestProperty(owner.client);
    await grantPropertyRole(owner.client, viewer.id, property.id, null, 'viewer');
  }, 60000);

  describe('setPublicVisibility', () => {
    it('owner can set public visibility', async () => {
      const { error } = await setPublicVisibility(owner.client, property.id, true);
      expect(error).toBeUndefined();

      // Verify visibility was set
      const { data: prop } = await owner.client
        .from('properties')
        .select('public_visibility, public_slug')
        .eq('id', property.id)
        .maybeSingle();

      expect(prop?.public_visibility).toBe(true);
      expect(prop?.public_slug).toBeDefined();
    });

    it('viewer cannot set public visibility', async () => {
      const { error } = await setPublicVisibility(viewer.client, property.id, false);
      expect(error).not.toBeNull();
    });

    it('generates slug when setting to public', async () => {
      const newProperty = await createTestProperty(owner.client, `UPRN-SLUG-${Date.now()}`, 'Test Property Address');
      await setPublicVisibility(owner.client, newProperty.id, true);

      const { data: prop } = await owner.client
        .from('properties')
        .select('public_slug')
        .eq('id', newProperty.id)
        .maybeSingle();

      expect(prop?.public_slug).toBeDefined();
      expect(prop?.public_slug).toMatch(/test-property-address/);
    });

    it('anonymous user can access public property', async () => {
      await setPublicVisibility(owner.client, property.id, true);
      await owner.client.from('properties').update({ status: 'active' }).eq('id', property.id);

      const { data, error } = await anonClient
        .from('properties')
        .select('id, public_visibility')
        .eq('id', property.id)
        .maybeSingle();

      expect(error).toBeNull();
      expect(data?.public_visibility).toBe(true);
    });
  });
}

