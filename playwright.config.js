// @ts-check
import { defineConfig, devices } from '@playwright/test';

<<<<<<< HEAD

=======
>>>>>>> 348596666228ff8ed34b5cfb253a7429e7217f7b
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
<<<<<<< HEAD
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
=======
  testDir: './test/e2e',
  /* Run tests in files in parallel */
  fullyParallel: false,
>>>>>>> 348596666228ff8ed34b5cfb253a7429e7217f7b
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
<<<<<<< HEAD
  workers: process.env.CI ? 1 : undefined,
=======
  workers: 1,
>>>>>>> 348596666228ff8ed34b5cfb253a7429e7217f7b
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',
<<<<<<< HEAD
   baseURL: 'https://sos2526-10.onrender.com',
    actionTimeout: 60000,
    navigationTimeout: 60000,
  
=======

>>>>>>> 348596666228ff8ed34b5cfb253a7429e7217f7b
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

<<<<<<< HEAD


=======
>>>>>>> 348596666228ff8ed34b5cfb253a7429e7217f7b
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
<<<<<<< HEAD

=======
    /* Disabled in development
>>>>>>> 348596666228ff8ed34b5cfb253a7429e7217f7b
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
<<<<<<< HEAD
 

=======
    */
>>>>>>> 348596666228ff8ed34b5cfb253a7429e7217f7b
    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});

