import { Page, expect } from '@playwright/test';

export async function loginAs(page: Page, email: string, password: string = 'password123') {
  await page.goto('/auth/login', { waitUntil: 'commit' });
  await page.waitForSelector('h1', { state: 'visible', timeout: 15000 });
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 30000 });
}

export async function createProperty(page: Page, address: string) {
  await page.goto('/properties/create', { waitUntil: 'commit', timeout: 30000 });

  // Wait for form to be visible
  await page.waitForSelector('form', { state: 'visible', timeout: 15000 });

  // Fill form fields using labels (more resilient than testids)
  const line1Input = page.getByLabel(/address|line 1/i).first();
  if (await line1Input.isVisible()) {
    await line1Input.fill(address);
  }

  const cityInput = page.getByLabel(/city|town/i).first();
  if (await cityInput.isVisible()) {
    await cityInput.fill('London');
  }

  const postcodeInput = page.getByLabel(/postcode|post code|zip/i).first();
  if (await postcodeInput.isVisible()) {
    await postcodeInput.fill('W1A 1AA');
  }

  // Submit form
  await page.getByRole('button', { name: /create|submit|save/i }).click();

  // Wait for navigation to property page
  await expect(page).toHaveURL(/\/properties\/.+/, { timeout: 30000 });

  return page.url();
}

/**
 * Navigate to a page with relaxed wait settings for SSR pages.
 */
export async function gotoPage(page: Page, path: string, options?: { timeout?: number }) {
  await page.goto(path, {
    waitUntil: 'commit',
    timeout: options?.timeout ?? 30000
  });
}
