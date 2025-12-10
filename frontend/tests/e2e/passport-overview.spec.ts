import { expect, test } from '../helpers/fixtures';
import { createProperty } from '../helpers/test-helpers';
import { login } from '../helpers/login';

test('Passport overview sections render', async ({ page }) => {
  await login(page);
  await createProperty(page, '5 Overview Road');

  await expect(page.getByTestId('property-loaded')).toBeVisible();
  await expect(page.getByTestId('property-title')).toContainText('5 Overview Road');
  await expect(page.getByTestId('key-facts-loaded')).toBeVisible();
});
