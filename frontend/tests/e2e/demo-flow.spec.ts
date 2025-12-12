import { test, expect } from '@playwright/test';
import { login } from '../helpers/login';

test('Full investor demo flow - navigation check', async ({ page, request }) => {
  await request.post('/api/test/reset');
  await login(page);

  // Navigate to property create page
  await page.goto('/properties/create', { waitUntil: 'commit', timeout: 30000 });
  await expect(page).toHaveURL(/\/properties\/create/);

  // Navigate to properties list
  await page.goto('/properties', { waitUntil: 'commit', timeout: 30000 });
  await expect(page).toHaveURL(/\/properties/);

  // Navigate back to dashboard
  await page.goto('/dashboard', { waitUntil: 'commit', timeout: 30000 });
  await expect(page).toHaveURL(/\/dashboard/);
});
