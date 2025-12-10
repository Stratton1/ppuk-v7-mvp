/**
 * File: grant-role.spec.ts
 * Purpose: Integration tests for grantPropertyRole server action
 */

import { describe, expect, it, beforeAll } from 'vitest';
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
  describe.skip('Grant Role Integration (env missing)', () => {
    it('skipped', () => {});
  });
} else {
  let owner: TestUser;
  let targetUser: TestUser;
  let property: TestProperty;
  const adminClient = createAdminClient();

  beforeAll(async () => {
    const ownerData = await createTestUser(
      adminClient,
      `owner_${Date.now()}@test.local`,
      'consumer'
    );
    owner = await signInUser(ownerData.email);

    const targetData = await createTestUser(
      adminClient,
      `target_${Date.now()}@test.local`,
      'consumer'
    );
    targetUser = await signInUser(targetData.email);

    property = await createTestProperty(owner.client);
  }, 60000);

  describe('grantPropertyRole', () => {
    it('owner can grant viewer role', async () => {
      const { error } = await grantPropertyRole(
        owner.client,
        targetUser.id,
        property.id,
        null,
        'viewer'
      );

      expect(error).toBeUndefined();

      // Verify role was granted
      const { data: stakeholders } = await owner.client
        .from('property_stakeholders')
        .select('*')
        .eq('property_id', property.id)
        .eq('user_id', targetUser.id)
        .maybeSingle();

      expect(stakeholders).toBeDefined();
      expect(stakeholders?.permission).toBe('viewer');
    });

    it('owner can grant editor role', async () => {
      const newTargetData = await createTestUser(
        adminClient,
        `target2_${Date.now()}@test.local`,
        'consumer'
      );
      const newTarget = await signInUser(newTargetData.email);

      const { error } = await grantPropertyRole(
        owner.client,
        newTarget.id,
        property.id,
        null,
        'editor'
      );

      expect(error).toBeUndefined();

      // Verify role was granted
      const { data: stakeholders } = await owner.client
        .from('property_stakeholders')
        .select('*')
        .eq('property_id', property.id)
        .eq('user_id', newTarget.id)
        .maybeSingle();

      expect(stakeholders).toBeDefined();
      expect(stakeholders?.permission).toBe('editor');
    });

    it('viewer cannot grant roles', async () => {
      const viewerData = await createTestUser(
        adminClient,
        `viewer_${Date.now()}@test.local`,
        'consumer'
      );
      const viewer = await signInUser(viewerData.email);
      await grantPropertyRole(owner.client, viewer.id, property.id, null, 'viewer');

      const newTargetData = await createTestUser(
        adminClient,
        `target3_${Date.now()}@test.local`,
        'consumer'
      );
      const newTarget = await signInUser(newTargetData.email);

      const { error } = await grantPropertyRole(
        viewer.client,
        newTarget.id,
        property.id,
        null,
        'viewer'
      );

      expect(error).not.toBeNull();
    });

    it('validates user exists', async () => {
      const fakeUserId = '00000000-0000-0000-0000-000000000000';
      const { error } = await grantPropertyRole(
        owner.client,
        fakeUserId,
        property.id,
        null,
        'viewer'
      );

      // Should fail because user doesn't exist (foreign key constraint)
      expect(error).not.toBeNull();
    });
  });
}

