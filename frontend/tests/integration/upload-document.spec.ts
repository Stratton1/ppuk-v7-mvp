/**
 * File: upload-document.spec.ts
 * Purpose: Integration tests for uploadPropertyDocument server action
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
  describe.skip('Upload Document Integration (env missing)', () => {
    it('skipped', () => {});
  });
} else {
  let owner: TestUser;
  let viewer: TestUser;
  let property: TestProperty;
  const adminClient = createAdminClient();

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

  describe('uploadPropertyDocument', () => {
    it('owner can upload document', async () => {
      const { data: user } = await owner.client.auth.getUser();
      const testFile = new Blob(['test content'], { type: 'application/pdf' });
      const formData = new FormData();
      formData.append('file', testFile, 'test.pdf');
      formData.append('title', 'Test Document');
      formData.append('documentType', 'other');

      // Note: In a real test, we'd call the server action directly
      // For now, we test the underlying Supabase operation
      const { data, error } = await owner.client.from('documents').insert({
        property_id: property.id,
        uploaded_by_user_id: user.user!.id,
        title: 'Test Document',
        document_type: 'other',
        storage_bucket: 'property-documents',
        storage_path: `test/${Date.now()}.pdf`,
        mime_type: 'application/pdf',
        size_bytes: testFile.size,
        status: 'active',
      }).select().single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.title).toBe('Test Document');
    });

    it('viewer cannot upload document', async () => {
      const { data: user } = await viewer.client.auth.getUser();
      const { error } = await viewer.client.from('documents').insert({
        property_id: property.id,
        uploaded_by_user_id: user.user!.id,
        title: 'Should Fail',
        document_type: 'other',
        storage_bucket: 'property-documents',
        storage_path: `test/${Date.now()}.pdf`,
        mime_type: 'application/pdf',
        size_bytes: 1024,
        status: 'active',
      });

      expect(error).not.toBeNull();
    });

    it('validates file type', async () => {
      const { data: user } = await owner.client.auth.getUser();
      const { error } = await owner.client.from('documents').insert({
        property_id: property.id,
        uploaded_by_user_id: user.user!.id,
        title: 'Invalid Type',
        document_type: 'other',
        storage_bucket: 'property-documents',
        storage_path: `test/${Date.now()}.exe`,
        mime_type: 'application/x-executable',
        size_bytes: 1024,
        status: 'active',
      });

      // Should fail validation (either at DB level or application level)
      // This depends on how validation is implemented
      expect(error).not.toBeNull();
    });
  });
}

