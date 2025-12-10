import type { Page } from '@playwright/test';

export async function login(page: Page) {
  await page.goto('http://localhost:3000/test/login?testmode=1');
  await page.getByTestId('test-login-root').waitFor({ timeout: 15000 });
  await page.getByTestId('test-login-owner').click();
  await page.waitForURL('**/dashboard**', { timeout: 30000 });
  await page.getByTestId('dashboard-root').waitFor({ timeout: 30000 });
  await page.getByTestId('dashboard-loaded').waitFor({ timeout: 30000 });
}
