import { expect, test } from '../helpers/fixtures';

test('Public passport loads', async ({ page }) => {
  await page.goto('/p/example-slug');
  await expect(page.getByTestId('public-passport-root')).toBeVisible();
});
