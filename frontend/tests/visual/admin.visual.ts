/**
 * Visual capture for admin user pages (unauthenticated state).
 * Run: npx playwright test --project=visual frontend/tests/visual/admin.visual.ts
 * Captures: login page, admin users, admin audit pages (screenshots + video).
 */
import { test } from '@playwright/test';

test('admin visual flow', async ({ page }) => {
  // Capture login page (entry point for admins)
  await page.goto('/auth/login');
  await page.waitForSelector('h1', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test-results/admin-login.png', fullPage: true });

  // Navigate to admin users (will show login/redirect state)
  await page.goto('/admin/users');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'test-results/admin-users-unauth.png', fullPage: true });

  // Navigate to admin audit (will show login/redirect state)
  await page.goto('/admin/audit');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'test-results/admin-audit-unauth.png', fullPage: true });
});
