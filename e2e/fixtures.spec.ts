import type { BrowserContext } from "@playwright/test";
import { expect, test } from "./fixtures";

test.describe.configure({ mode: "serial" });

let secondDevice: BrowserContext;

test("a test opens a second device", async ({ browser }) => {
  secondDevice = await browser.newContext();
  await secondDevice.newPage();
});

test("the next test finds that device closed", async ({ browser }) => {
  expect(browser.contexts()).not.toContain(secondDevice);
});
