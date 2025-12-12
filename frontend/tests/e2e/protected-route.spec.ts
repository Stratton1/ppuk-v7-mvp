import { test, expect } from '@playwright/test';

test('unauthenticated users are redirected to login', async ({ page, context, request }) => {
  await request.post('/api/test/reset');
  await context.clearCookies();

  // Try to access dashboard without being logged in
  await page.goto('/dashboard');

  // Should be redirected to login page
  await expect(page).toHaveURL(/\/auth\/login/, { timeout: 30000 });

  // Login form should be visible
  await page.getByRole('heading', { name: /sign in/i }).waitFor({ timeout: 15000 });
});
