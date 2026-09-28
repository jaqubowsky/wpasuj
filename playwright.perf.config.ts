import { defineConfig, devices } from "@playwright/test";
import e2e from "./playwright.config";

export default defineConfig({
  testDir: "./perf",
  workers: 1,
  forbidOnly: !!process.env.CI,
  reporter: "list",
  use: { baseURL: "http://localhost:3000", timezoneId: "Europe/Warsaw" },
  projects: [{ name: "phone-chromium", use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" } }],
  webServer: e2e.webServer,
});
