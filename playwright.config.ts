import { defineConfig, devices } from "@playwright/test";

const PORT = 5180;
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    // The app formats times in the visitor's timezone; pin it so the
    // expected times in the tests are the same everywhere.
    timezoneId: "Europe/London",
    locale: "en-GB",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "desktop",
      // Locally use the installed Chrome; CI installs Playwright's Chromium.
      use: { ...devices["Desktop Chrome"], channel: isCI ? undefined : "chrome" },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"], channel: isCI ? undefined : "chrome" },
      testMatch: /mobile\.spec\.ts/,
    },
  ],
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !isCI,
  },
});
