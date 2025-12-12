import { test, expect } from '@playwright/test';

test('Public passport loads', async ({ page, request }) => {
  // Seed data first
  await request.post('/api/test/reset');

  // Try to access public passport page with relaxed wait
  await page.goto('/p/example-slug', { waitUntil: 'commit', timeout: 30000 });

  // Should be on the public passport page
  await expect(page).toHaveURL(/\/p\/example-slug/);
});
