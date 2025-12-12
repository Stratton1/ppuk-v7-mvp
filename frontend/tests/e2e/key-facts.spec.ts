import { test, expect } from '@playwright/test';
import { login } from '../helpers/login';

test('Key Facts page loads', async ({ page, request }) => {
  await request.post('/api/test/reset');
  await login(page);

  // Navigate to properties
  await page.goto('/properties', { waitUntil: 'commit', timeout: 30000 });
  await expect(page).toHaveURL(/\/properties/);
});
