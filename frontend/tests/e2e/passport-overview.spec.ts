import { test, expect } from '@playwright/test';
import { login } from '../helpers/login';

test('Passport overview - authenticated access', async ({ page, request }) => {
  await request.post('/api/test/reset');
  await login(page);

  // Navigate to properties list
  await page.goto('/properties', { waitUntil: 'commit', timeout: 30000 });
  await expect(page).toHaveURL(/\/properties/);
});
