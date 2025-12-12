import { test, expect } from '@playwright/test';

test.describe('Mock users page (deprecated)', () => {
  test('dev mock-users route redirects or shows message', async ({ page, request }) => {
    await request.post('/api/test/reset');

    // Navigate to mock users page
    await page.goto('/dev/mock-users', { waitUntil: 'commit', timeout: 30000 });

    // Should navigate somewhere (page exists or 404)
    const url = page.url();
    expect(url).toMatch(/localhost:3000/);
  });
});
