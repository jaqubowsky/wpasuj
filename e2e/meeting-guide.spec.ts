import { expect, test } from "@playwright/test";
import { expectAccessible } from "./accessibility";
import { saveScreenshot } from "./screenshot";
import { siteUrl } from "../playwright.config";

const path = "/jak-ustalic-termin";
const title = "Jak ustalić termin spotkania ze znajomymi";

test("friends can read the guide and create a poll", async ({ page }, testInfo) => {
  await page.goto(path);

  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
  const main = page.getByRole("main");
  const words = (await main.innerText()).trim().split(/\s+/).length;

  expect(words).toBeGreaterThanOrEqual(500);
  expect(words).toBeLessThanOrEqual(800);
  await expect(main.getByRole("heading", { level: 3 })).toHaveCount(8);
  await expect(main.getByRole("img")).toHaveCount(3);

  for (const image of await main.getByRole("img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect(image).toBeVisible();
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
  }

  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(testInfo.project.use.viewport!.width);
  await saveScreenshot(page, testInfo, "meeting-guide");
  await expectAccessible(page);
  const create = main.getByRole("link", { name: "Utwórz ankietę", exact: true });

  await expect(create).toHaveAttribute("href", "/#utworz");
  await create.focus();
  await expect(create).toBeFocused();
  await create.press("Enter");

  await expect(page).toHaveURL(/\/#utworz$/);
  await expect(page.getByRole("textbox", { name: "Co robimy?" })).toBeVisible();
});

test("friends can reach the guide from the landing footer", async ({ page }, testInfo) => {
  await page.goto("/");
  const guide = page.getByRole("contentinfo").getByRole("link", { name: "Jak ustalić termin" });

  await guide.scrollIntoViewIfNeeded();
  await expect(guide).toHaveAttribute("href", path);
  await page.screenshot({ path: `e2e/screenshots/landing-guide-link-${testInfo.project.name}.png` });
  await guide.click();

  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
});

test("search engines can identify the guide and follow its instructions", async ({ page, request }) => {
  await page.goto(path);

  await expect(page).toHaveTitle(`${title} · Wpasuj`);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /Czat, jedna propozycja czy ankieta/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${siteUrl}${path}`);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
  const [article, howTo] = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);

  expect(article).toMatchObject({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    inLanguage: "pl",
    url: `${siteUrl}${path}`,
  });

  expect(howTo).toMatchObject({ "@context": "https://schema.org", "@type": "HowTo", inLanguage: "pl" });
  expect(howTo.step).toHaveLength(5);

  for (const step of howTo.step) {
    const section = page.locator(new URL(step.url).hash);

    expect(step["@type"]).toBe("HowToStep");
    await expect(section.getByRole("heading")).toHaveText(step.name);
    await expect(section.locator("p")).toHaveText(step.text);
  }

  for (const image of article.image) {
    const response = await request.get(new URL(image).pathname);

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/");
  }
});
