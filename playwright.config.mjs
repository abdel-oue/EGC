import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: true,
  workers: 2,
  timeout: 90000,
  expect: {
    timeout: 10000,
  },
  reporter: "list",
  use: {
    baseURL: "http://localhost:3100",
    trace: "retain-on-failure",
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
    },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" } },
  ],
  webServer: [
    { command: "npm exec --workspace @egc/landing -- next start --port 3100", url: "http://localhost:3100/fr", reuseExistingServer: !process.env.CI },
    { command: "npm exec --workspace @egc/admin -- next start --port 3101", url: "http://localhost:3101/login", reuseExistingServer: !process.env.CI },
  ],
});
