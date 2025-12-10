import { test } from '../helpers/fixtures';
import { createProperty } from '../helpers/test-helpers';
import { login } from '../helpers/login';

test('Full investor demo flow', async ({ page }) => {
  await login(page);

  const propertyUrl = await createProperty(page, '100 Demo Street');
  console.log('Property created at:', propertyUrl);

  await page.getByTestId('add-event-button').click();
  await page.getByTestId('event-title').fill('Searches ordered');
  await page.getByTestId('event-submit').click();

  await page.getByTestId('add-task-button').click();
  await page.getByTestId('task-title').fill('Provide proof of funds');
  await page.getByTestId('task-submit').click();

  await page.getByTestId('invite-button').click();
  await page.getByTestId('invite-email').fill('buyer@test.com');
  await page.getByTestId('invite-submit').click();

  await page.screenshot({ path: 'screenshots/final-passport.png', fullPage: true });
});
