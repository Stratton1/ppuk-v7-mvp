import { test, expect } from '@playwright/test';
import { login } from '../helpers/login';

test('Dashboard loads', async ({ page, request }) => {
  // Reset test data
  await request.post('/api/test/reset');

  // Login
  await login(page);

  // Verify we're on dashboard URL
  await expect(page).toHaveURL(/\/dashboard/);

  // Dashboard SSR may be slow - verify we stay on dashboard (no redirect loop)
  await page.waitForTimeout(2000);
  await expect(page).toHaveURL(/\/dashboard/);
});
