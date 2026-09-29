import { defineConfig } from "@playwright/test";
import e2e from "./playwright.config";

export default defineConfig({
  testDir: "./readme",
  workers: 1,
  reporter: "list",
  use: { baseURL: "http://localhost:3000", timezoneId: "Europe/Warsaw", locale: "pl-PL" },
  webServer: e2e.webServer,
});
