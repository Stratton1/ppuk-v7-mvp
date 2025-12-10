import { expect, test } from '../helpers/fixtures';
import { createProperty } from '../helpers/test-helpers';
import { login } from '../helpers/login';

test('User can create a property', async ({ page }) => {
  await login(page);
  const url = await createProperty(page, '123 Test Street');
  expect(url).toMatch(/properties\/.+/);
  await expect(page.getByTestId('property-title')).toContainText('123 Test Street');
});
