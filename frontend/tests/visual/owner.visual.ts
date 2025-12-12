/**
 * Visual capture for owner user pages (unauthenticated state).
 * Run: npx playwright test --project=visual frontend/tests/visual/owner.visual.ts
 * Captures: login page, dashboard, properties, tasks pages (screenshots + video).
 */
import { test } from '@playwright/test';

test('owner visual flow', async ({ page }) => {
  // Capture login page (entry point for owners)
  await page.goto('/auth/login');
  await page.waitForSelector('h1', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test-results/owner-login.png', fullPage: true });

  // Navigate to dashboard (will show login/redirect state)
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'test-results/owner-dashboard-unauth.png', fullPage: true });

  // Navigate to properties (will show login/redirect state)
  await page.goto('/properties');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'test-results/owner-properties-unauth.png', fullPage: true });

  // Navigate to tasks (will show login/redirect state)
  await page.goto('/tasks');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'test-results/owner-tasks-unauth.png', fullPage: true });
});
