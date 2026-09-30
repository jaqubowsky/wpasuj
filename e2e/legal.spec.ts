import { expect, test } from "@playwright/test";
import { saveScreenshot } from "./screenshot";

const pages = [
  { path: "/polityka-prywatnosci", title: "Polityka prywatności", screen: "privacy-policy" },
  { path: "/regulamin", title: "Regulamin", screen: "terms" },
];

for (const { path, title, screen } of pages) {
  test(`${title} reads in two phone screens and links the contact address`, async ({ page }, testInfo) => {
    await page.goto(path);

    await expect(page).toHaveTitle(`${title} · Wpasuj`);
    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();

    await expect(page.getByRole("main").getByRole("link", { name: "kontakt@wpasuj.pl" }).first()).toHaveAttribute(
      "href",
      "mailto:kontakt@wpasuj.pl",
    );

    await expect(page.getByRole("contentinfo").getByRole("link", { name: title })).toHaveAttribute("href", path);

    const { height, screenHeight } = await page.evaluate(() => ({
      height: document.documentElement.scrollHeight,
      screenHeight: window.innerHeight,
    }));

    if (testInfo.project.name.startsWith("phone")) expect(height).toBeLessThanOrEqual(2 * screenHeight);

    await saveScreenshot(page, testInfo, screen);
  });
}
