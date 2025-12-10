/**
 * File: tasks.spec.ts
 * Purpose: Integration tests for task-related server actions
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
  describe.skip('Tasks Integration (env missing)', () => {
    it('skipped', () => {});
  });
} else {
  let owner: TestUser;
  let editor: TestUser;
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

    const editorData = await createTestUser(
      adminClient,
      `editor_${Date.now()}@test.local`,
      'consumer'
    );
    editor = await signInUser(editorData.email);

    const viewerData = await createTestUser(
      adminClient,
      `viewer_${Date.now()}@test.local`,
      'consumer'
    );
    viewer = await signInUser(viewerData.email);

    property = await createTestProperty(owner.client);
    await grantPropertyRole(owner.client, editor.id, property.id, null, 'editor');
    await grantPropertyRole(owner.client, viewer.id, property.id, null, 'viewer');
  }, 60000);

  describe('Tasks Actions', () => {
    it('owner can create task', async () => {
      const { data: user } = await owner.client.auth.getUser();
      const { data, error } = await owner.client.from('tasks').insert({
        property_id: property.id,
        title: 'Owner Task',
        description: 'Test task from owner',
        status: 'open',
        priority: 'high',
        created_by_user_id: user.user!.id,
      }).select().single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.title).toBe('Owner Task');
    });

    it('editor can create task', async () => {
      const { data: user } = await editor.client.auth.getUser();
      const { data, error } = await editor.client.from('tasks').insert({
        property_id: property.id,
        title: 'Editor Task',
        description: 'Test task from editor',
        status: 'open',
        priority: 'medium',
        created_by_user_id: user.user!.id,
      }).select().single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('viewer cannot create task', async () => {
      const { data: user } = await viewer.client.auth.getUser();
      const { error } = await viewer.client.from('tasks').insert({
        property_id: property.id,
        title: 'Viewer Task',
        description: 'Should fail',
        status: 'open',
        priority: 'low',
        created_by_user_id: user.user!.id,
      });

      expect(error).not.toBeNull();
    });

    it('assigned user can update task status', async () => {
      const { data: ownerUser } = await owner.client.auth.getUser();
      const { data: editorUser } = await editor.client.auth.getUser();

      // Owner creates task and assigns to editor
      const { data: task } = await owner.client.from('tasks').insert({
        property_id: property.id,
        title: 'Assigned Task',
        description: 'Task assigned to editor',
        status: 'open',
        priority: 'medium',
        assigned_to_user_id: editorUser.user!.id,
        created_by_user_id: ownerUser.user!.id,
      }).select().single();

      if (task) {
        // Editor can update task status
        const { error } = await editor.client
          .from('tasks')
          .update({ status: 'in_progress' })
          .eq('id', task.id);

        expect(error).toBeNull();
      }
    });

    it('viewer can read tasks but not update', async () => {
      const { data: ownerUser } = await owner.client.auth.getUser();
      const { data: task } = await owner.client.from('tasks').insert({
        property_id: property.id,
        title: 'Viewer Read Task',
        description: 'Task for viewer to read',
        status: 'open',
        priority: 'low',
        created_by_user_id: ownerUser.user!.id,
      }).select().single();

      if (task) {
        // Viewer can read
        const { data: readTask, error: readError } = await viewer.client
          .from('tasks')
          .select('*')
          .eq('id', task.id)
          .maybeSingle();

        expect(readError).toBeNull();
        expect(readTask?.id).toBe(task.id);

        // Viewer cannot update
        const { error: updateError } = await viewer.client
          .from('tasks')
          .update({ status: 'resolved' })
          .eq('id', task.id);

        expect(updateError).not.toBeNull();
      }
    });
  });
}

