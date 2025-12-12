import { test, expect } from '@playwright/test';
import { login } from '../helpers/login';

test('User can access property pages', async ({ page, request }) => {
  await request.post('/api/test/reset');
  await login(page);

  // Navigate to properties
  await page.goto('/properties', { waitUntil: 'commit', timeout: 30000 });
  await expect(page).toHaveURL(/\/properties/);
});
