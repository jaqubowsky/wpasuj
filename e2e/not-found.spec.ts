import { expect, test } from "./fixtures";
import { saveScreenshot } from "./screenshot";

test("an unknown URL says so in Polish and links to a new poll", async ({ page }, testInfo) => {
  const response = await page.goto("/nieistnieje");

  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Nie ma takiej strony" })).toBeVisible();
  await expect(page.getByText("Sprawdź link albo zrób własną ankietę.")).toBeVisible();
  await saveScreenshot(page, testInfo, "not-found");
  await page.getByRole("link", { name: "Zrób własną ankietę" }).click();

  await expect(page.getByRole("textbox", { name: "Co robimy?" })).toBeVisible();
});
