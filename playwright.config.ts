import { defineConfig, devices } from "@playwright/test";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const databasePath = join(tmpdir(), "wpasuj-e2e.db");
export const siteUrl = "https://wpasuj.example";
const containerUrl = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: "./e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: containerUrl ?? "http://localhost:3000",
    trace: "retain-on-failure",
    timezoneId: "Europe/Warsaw",
  },
  projects: [
    { name: "phone-chromium", use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" } },
    { name: "phone-webkit", use: { ...devices["iPhone 13"] } },
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
  ],
  webServer: containerUrl
    ? undefined
    : {
        command: `rm -f ${databasePath} ${databasePath}-wal ${databasePath}-shm && npm run start`,
        url: "http://localhost:3000",
        env: { DATABASE_PATH: databasePath, DEMO_ROUTES: "1", SITE_URL: siteUrl },
        reuseExistingServer: false,
      },
});
