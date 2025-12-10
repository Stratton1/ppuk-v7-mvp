import { expect, test } from '../helpers/fixtures';
import { createProperty } from '../helpers/test-helpers';
import { login } from '../helpers/login';

test('User can add and complete tasks', async ({ page }) => {
  await login(page);
  await createProperty(page, '18 Task Road');

  await page.getByTestId('add-task-button').click();
  await page.getByTestId('task-title').fill('Provide ID documents');
  await page.getByTestId('task-submit').click();

  const task = page.getByTestId('task-item').first();
  await expect(task).toContainText('Provide ID documents');

  await task.getByTestId('task-checkbox').click();
  await expect(task.getByTestId('task-checkbox')).toHaveText(/Reopen/);
});
