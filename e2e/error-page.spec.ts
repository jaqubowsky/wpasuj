import { randomUUID } from "node:crypto";
import { expect, test } from "./fixtures";
import { saveScreenshot } from "./screenshot";

test("a server error shows the Polish error page, and trying again renders the page anew", async ({ page }, testInfo) => {
  await page.goto(`/dev/error?run=${randomUUID()}`);

  await expect(page.getByRole("heading", { name: "Coś poszło nie tak" })).toBeVisible();
  await saveScreenshot(page, testInfo, "error-page");
  await page.getByRole("button", { name: "Spróbuj ponownie" }).click();

  await expect(page.getByRole("heading", { name: "Druga próba działa" })).toBeVisible();
});

test("the error page links to a new poll", async ({ page }) => {
  await page.goto(`/dev/error?run=${randomUUID()}`);

  await page.getByRole("link", { name: "Zrób własną ankietę" }).click();

  await expect(page.getByRole("textbox", { name: "Co robimy?" })).toBeVisible();
});
