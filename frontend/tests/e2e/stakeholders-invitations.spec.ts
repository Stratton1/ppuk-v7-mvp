import { expect, test } from '../helpers/fixtures';
import { createProperty } from '../helpers/test-helpers';
import { login } from '../helpers/login';

test('User can invite stakeholders', async ({ page }) => {
  await login(page);
  await createProperty(page, '22 Stakeholder Way');

  await page.getByTestId('invite-button').click();
  await page.getByTestId('invite-email').fill('buyer@ppuk.test');
  await page.getByTestId('invite-submit').click();

  await expect(page.getByTestId('invite-row').first()).toContainText('buyer@ppuk.test');
});
