import { test, expect } from '@playwright/test';

test('dashboard loads without redirect loop', async ({ page, request }) => {
  // Reset test data to ensure clean state
  await request.post('/api/test/reset');

  // Navigate to test login page
  await page.goto('/test/login?testmode=1');

  // Wait for test login panel
  await page.waitForSelector('[data-testid="test-login-root"]', {
    state: 'visible',
    timeout: 15000
  });

  // Click owner login button
  await page.getByTestId('test-login-owner').click();

  // Wait for URL to be dashboard
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 30000 });

  // Wait a moment to check for redirect loops
  await page.waitForTimeout(3000);

  // Should still be on dashboard (no loop back to login)
  await expect(page).toHaveURL(/\/dashboard/);
});
