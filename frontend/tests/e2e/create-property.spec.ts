import { test, expect } from '@playwright/test';
import { login } from '../helpers/login';

test('User can access create property page', async ({ page, request }) => {
  await request.post('/api/test/reset');
  await login(page);

  // Navigate to create property page
  await page.goto('/properties/create', { waitUntil: 'commit', timeout: 30000 });

  // Verify we're on the create property page
  await expect(page).toHaveURL(/\/properties\/create/);
});
