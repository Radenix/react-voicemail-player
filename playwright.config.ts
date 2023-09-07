import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://127.0.0.1:3000",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    // disabling testing in Firefox on CI beacuse of the error that is raised
    // when trying to play the audio. The error is the following:
    // Error Code: NS_ERROR_DOM_MEDIA_MEDIASINK_ERR (0x806e000b)
    // Details: OnMediaSinkAudioError"
    // This only happens on CI (or in local Docker container with Ubuntu).
    // I've tried changin the audio that is loaded in tests to a different
    // formats, but there error persisted. I've also tried a couple of
    // suggestions that I've found online (mostly dealing with PulseAudio, but
    // those did not help, too). So I decided to disable testing in Firefox on
    // CI as I don't currently have time to dig deeper into the issue.
    process.env.CI
      ? (undefined as any)
      : {
          name: "firefox",
          use: { ...devices["Desktop Firefox"] },
        },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ].filter(Boolean),

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "yarn serve:e2e",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
  },
});
