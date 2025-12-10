import { expect, test } from '../helpers/fixtures';
import { createProperty } from '../helpers/test-helpers';
import { login } from '../helpers/login';

test('Key Facts cards render', async ({ page }) => {
  await login(page);
  await createProperty(page, '44 EPC Lane');

  await expect(page.getByTestId('keyfacts-epc')).toBeVisible();
  await expect(page.getByTestId('keyfacts-flood')).toBeVisible();
  await expect(page.getByTestId('keyfacts-planning')).toBeVisible();
  await expect(page.getByTestId('keyfacts-title')).toBeVisible();
});
