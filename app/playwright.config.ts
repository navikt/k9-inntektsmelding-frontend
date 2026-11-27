import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["line"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      grepInvert: /@uu/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "uu",
      grep: /@uu/,
      grepInvert: /@nettleserzoom/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "uu-smal",
      grep: /@uu/,
      grepInvert: /@kjent-avvik|@nettleserzoom/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 320, height: 256 },
      },
    },
    {
      name: "uu-zoom",
      grep: /@nettleserzoom/,
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "yarn dev",
    port: 5173,
    reuseExistingServer: true,
  },
});
