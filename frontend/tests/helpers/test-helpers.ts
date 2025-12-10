import { Page, expect } from '@playwright/test';

export async function loginAs(page: Page, email: string, password: string = 'TestPassword123!') {
  await page.goto('/auth/login');
  await page.getByTestId('login-email').fill(email);
  await page.getByTestId('login-password').fill(password);
  await page.getByTestId('login-submit').click();
  await page.getByTestId('dashboard-loaded').waitFor();
}

export async function createProperty(page: Page, address: string) {
  await page.goto('/properties/create');
  await expect(page.getByTestId('create-property-form')).toBeVisible();
  await page.getByTestId('create-property-line1').fill(address);
  await page.getByTestId('create-property-city').fill('London');
  await page.getByTestId('create-property-postcode').fill('W1A 1AA');
  await page.getByTestId('create-property-uprn').fill(`UPRN-${Date.now()}`);
  await page.getByTestId('create-property-submit').click();
  await page.waitForURL(/\/properties\/.+/);
  await page.getByTestId('property-loaded').waitFor();
  return page.url();
}
