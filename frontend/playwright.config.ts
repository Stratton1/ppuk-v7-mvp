import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: 0,
  workers: 1,

  reporter: [['html', { outputFolder: 'playwright-report' }]],

  use: {
    baseURL: 'http://localhost:3000',
  },

  projects: [
    {
      name: 'e2e',
      testMatch: /tests\/e2e\/.*\.spec\.ts/,
      use: {
        baseURL: 'http://localhost:3000',
        headless: true,
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'retain-on-failure',
      },
    },

    {
      name: 'visual',
      testMatch: /tests\/visual\/.*\.visual\.ts/,
      retries: 0,
      workers: 1,
      use: {
        baseURL: 'http://localhost:3000',
        headless: false,
        screenshot: 'on',
        video: 'on',
        trace: 'on',
        launchOptions: {
          slowMo: 250,
        },
      },
    },
  ],

  webServer: {
    command: 'PLAYWRIGHT_TEST=true NODE_ENV=test PORT=3000 npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});