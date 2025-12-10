import { expect, test } from '../helpers/fixtures';
import { createProperty } from '../helpers/test-helpers';
import { login } from '../helpers/login';

test('Timeline allows adding events', async ({ page }) => {
  await login(page);
  await createProperty(page, '12 Event Road');

  await page.getByTestId('add-event-button').click();
  await page.getByTestId('event-title').fill('Survey booked');
  await page.getByTestId('event-submit').click();

  await expect(page.getByTestId('timeline-list')).toBeVisible();
  await expect(page.getByTestId('timeline-event').first()).toContainText('Survey booked');
});
