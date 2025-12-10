import { expect, test } from '../helpers/fixtures';
import { login } from '../helpers/login';

test('User can update profile', async ({ page }) => {
  await login(page);
  await page.goto('/settings');

  await page.getByTestId('settings-full-name').fill('Updated User');
  await page.getByTestId('settings-save').click();

  await expect(page.getByText('Profile updated')).toBeVisible();
});
