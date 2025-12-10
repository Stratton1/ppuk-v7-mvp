import { expect, test } from '../helpers/fixtures';
import { login } from '../helpers/login';

test('Dashboard loads', async ({ page }) => {
  await login(page);
  await expect(page.getByTestId('dashboard-loaded')).toBeVisible();
  await expect(page.getByTestId('properties-list')).toBeVisible();
});
