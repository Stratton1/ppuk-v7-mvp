/**
 * Visual capture for public pages.
 * Run: npx playwright test --project=visual frontend/tests/visual/public.visual.ts
 * Captures: homepage, login page, register page (screenshots + video).
 */
import { test } from '@playwright/test';

test('public passport visual flow', async ({ page }) => {
  // Capture homepage
  await page.goto('/');
  await page.waitForSelector('h1', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test-results/public-homepage.png', fullPage: true });

  // Capture login page
  await page.goto('/auth/login');
  await page.waitForSelector('h1', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test-results/public-login.png', fullPage: true });

  // Capture register page
  await page.goto('/auth/register');
  await page.waitForSelector('h1', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test-results/public-register.png', fullPage: true });
});
