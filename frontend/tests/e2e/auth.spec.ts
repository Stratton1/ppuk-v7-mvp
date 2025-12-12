import { test, expect } from '@playwright/test';
import { login } from '../helpers/login';

test('User can log in', async ({ page, request }) => {
  // Reset test data
  await request.post('/api/test/reset');

  // Login using helper
  await login(page);

  // Verify we're on dashboard URL (login succeeded)
  await expect(page).toHaveURL(/\/dashboard/);
});
