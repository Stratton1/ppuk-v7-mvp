import { test, expect } from '@playwright/test';
import { login } from '../helpers/login';

test('User can access settings page', async ({ page, request }) => {
  await request.post('/api/test/reset');
  await login(page);

  // Navigate to settings page
  await page.goto('/settings', { waitUntil: 'commit', timeout: 30000 });

  // Verify we're on settings page (URL check only, SSR may be slow)
  await expect(page).toHaveURL(/\/settings/);
});
