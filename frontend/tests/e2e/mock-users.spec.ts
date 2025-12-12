import { expect, test } from '../helpers/fixtures';

test.describe('Mock users page (deprecated)', () => {
  test('shows deprecation notice and no actions', async ({ page }) => {
    await page.goto('/dev/mock-users');

    await expect(page.getByText('Mock users')).toBeVisible();
    await expect(page.getByText(/Mock Supabase mode has been removed/i)).toBeVisible();
    await expect(page.locator('[data-testid="mock-user-reset"]')).toHaveCount(0);
  });
});
