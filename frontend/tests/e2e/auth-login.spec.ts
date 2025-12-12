import { test, expect } from '@playwright/test';

test('login redirects to dashboard', async ({ page, request }) => {
  // Reset test data to ensure clean state
  const resetResponse = await request.post('/api/test/reset');
  expect(resetResponse.ok()).toBeTruthy();

  // Navigate to test login page
  await page.goto('/test/login?testmode=1');

  // Wait for test login panel to be visible
  await page.waitForSelector('[data-testid="test-login-root"]', {
    state: 'visible',
    timeout: 15000
  });

  // Click owner login button
  await page.getByTestId('test-login-owner').click();

  // Wait for URL to change to dashboard (auth redirect happened)
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 30000 });

  // Auth worked - we're on dashboard URL
});
