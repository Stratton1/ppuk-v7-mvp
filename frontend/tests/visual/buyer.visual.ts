/**
 * Visual capture for buyer user pages (unauthenticated state).
 * Run: npx playwright test --project=visual frontend/tests/visual/buyer.visual.ts
 * Captures: login page, dashboard redirect, properties page (screenshots + video).
 */
import { test } from '@playwright/test';

test('buyer visual flow', async ({ page }) => {
  // Capture login page (entry point for buyers)
  await page.goto('/auth/login');
  await page.waitForSelector('h1', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test-results/buyer-login.png', fullPage: true });

  // Navigate to dashboard (will show login/redirect state)
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'test-results/buyer-dashboard-unauth.png', fullPage: true });

  // Navigate to properties (will show login/redirect state)
  await page.goto('/properties');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'test-results/buyer-properties-unauth.png', fullPage: true });
});
