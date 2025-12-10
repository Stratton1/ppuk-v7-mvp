import { expect, test as base } from '@playwright/test';
import { login } from './login';

const test = base.extend({});

test.beforeEach(async ({ page }) => {
  page.setDefaultTimeout(45000);
  const res = await page.request.post('http://localhost:3000/api/test/reset');
  if (!res.ok()) {
    const body = await res.text();
    throw new Error(`Failed to reset test data: ${res.status()} ${res.statusText()} - ${body}`);
  }
  await page.context().clearCookies();
  await login(page);
});

export { expect, test };
