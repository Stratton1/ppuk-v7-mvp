import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Login helper for E2E tests.
 * Uses URL-based verification to handle Next.js App Router streaming/SSR delays.
 */
export async function login(page: Page, role: 'owner' | 'buyer' | 'agent' | 'admin' = 'owner') {
  // Navigate to test login page
  await page.goto('/test/login?testmode=1');

  // Wait for test login panel to be ready
  await page.waitForSelector('[data-testid="test-login-root"]', {
    state: 'visible',
    timeout: 15000
  });

  // Click the appropriate login button
  const testId = `test-login-${role}`;
  await page.getByTestId(testId).click();

  // Wait for redirect to dashboard URL
  // Use expect().toHaveURL() which handles App Router streaming better than waitForURL
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 30000 });
}

/**
 * Seed test data before running tests.
 * Call this once at the start of test suites that need seeded data.
 */
export async function seedTestData(page: Page) {
  const response = await page.request.post('/api/test/seed');
  if (!response.ok()) {
    const body = await response.text();
    throw new Error(`Failed to seed test data: ${response.status()} - ${body}`);
  }
  return response.json();
}

/**
 * Reset test data (clear and re-seed).
 * Use this to ensure a clean state between tests.
 */
export async function resetTestData(page: Page) {
  const response = await page.request.post('/api/test/reset');
  if (!response.ok()) {
    const body = await response.text();
    throw new Error(`Failed to reset test data: ${response.status()} - ${body}`);
  }
  return response.json();
}

/**
 * Wait for page to be ready after navigation.
 * Use after page.goto() to ensure content is loaded.
 */
export async function waitForPageReady(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  // Wait for any h1 to appear (basic content check)
  await page.waitForSelector('h1', { state: 'visible', timeout: 15000 }).catch(() => {
    // Some pages might not have h1, that's OK
  });
}
