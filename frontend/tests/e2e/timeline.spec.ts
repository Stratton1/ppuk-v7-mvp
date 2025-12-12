import { test, expect } from '@playwright/test';
import { login } from '../helpers/login';

test('Timeline - authenticated navigation', async ({ page, request }) => {
  await request.post('/api/test/reset');
  await login(page);

  // Navigate through authenticated pages
  await page.goto('/properties', { waitUntil: 'commit', timeout: 30000 });
  await expect(page).toHaveURL(/\/properties/);
});
