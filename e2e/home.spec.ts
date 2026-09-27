import { expect, test } from "@playwright/test";
import { productName } from "../src/shared/brand";
import { saveScreenshot } from "./screenshot";

test("the home page shows the wordmark on cream paper", async ({ page }, testInfo) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: productName })).toBeVisible();
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(251, 247, 241)");
  await saveScreenshot(page, testInfo, "home");
});
