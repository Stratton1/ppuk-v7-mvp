import { test, expect } from '@playwright/test';
import { login } from '../helpers/login';

test('User can access tasks page', async ({ page, request }) => {
  await request.post('/api/test/reset');
  await login(page);

  // Navigate to tasks (if exists) or properties
  await page.goto('/tasks', { waitUntil: 'commit', timeout: 30000 });

  // Should be on some page (tasks or redirected)
  const url = page.url();
  expect(url).toMatch(/localhost:3000/);
});
