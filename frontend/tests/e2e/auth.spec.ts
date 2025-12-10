import { expect } from '../helpers/fixtures';
import { test } from '../helpers/fixtures';
import { login } from '../helpers/login';

test('User can log in', async ({ page }) => {
  await login(page);
  await expect(page.getByTestId('dashboard-root')).toBeVisible();
  await expect(page.getByTestId('dashboard-loaded')).toBeVisible();
});
