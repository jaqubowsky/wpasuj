import { expect, test } from "@playwright/test";
import { siteUrl } from "../playwright.config";

const title = "Wpasuj, darmowe ankiety terminów dla znajomych";
const description = "Wrzucasz jeden link na grupę, każdy klika godziny, kiedy może. Najlepszy termin wyskakuje sam.";

test("the home page names itself to search engines and chat previews", async ({ page, request }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(title);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", description);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", title);
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", description);
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "pl_PL");
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
  const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
  const url = await page.locator('meta[property="og:url"]').getAttribute("content");

  expect([new URL(canonical!).href, new URL(url!).href]).toEqual([`${siteUrl}/`, `${siteUrl}/`]);
  const image = await page.locator('meta[property="og:image"]').getAttribute("content");

  expect(image).toBe(`${siteUrl}/og.png`);

  const card = await request.get(new URL(image!).pathname);

  expect(card.headers()["content-type"]).toBe("image/png");
  const png = await card.body();

  expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630]);
  expect(png.length).toBeLessThan(1024 * 1024);
});

test("the home page describes the app as a free web application", async ({ page }) => {
  await page.goto("/");

  const jsonLd = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);

  expect(jsonLd).toEqual({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Wpasuj",
    url: `${siteUrl}/`,
    description,
    inLanguage: "pl",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "PLN" },
  });
});

test("the sitemap lists the home page, the privacy policy and the terms, and robots points to it", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  const robots = await (await request.get("/robots.txt")).text();

  expect([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1])).toEqual([
    `${siteUrl}/`,
    `${siteUrl}/polityka-prywatnosci`,
    `${siteUrl}/regulamin`,
  ]);

  expect(robots).toContain("User-Agent: *\nAllow: /\nDisallow: /api/");
  expect(robots).toContain(`Sitemap: ${siteUrl}/sitemap.xml`);
});

test("the head links the app icons and both load", async ({ page, request }) => {
  await page.goto("/");

  const icon = await page.locator('link[rel="icon"][type="image/svg+xml"]').getAttribute("href");
  const appleIcon = await page.locator('link[rel="apple-touch-icon"]').getAttribute("href");

  expect(new URL(icon!, siteUrl).pathname).toBe("/icon.svg");
  expect(new URL(appleIcon!, siteUrl).pathname).toBe("/apple-icon");
  const svg = await request.get("/icon.svg");

  expect(svg.status()).toBe(200);
  expect(svg.headers()["content-type"]).toContain("image/svg+xml");
  const png = await request.get("/apple-icon");

  expect(png.status()).toBe(200);
  expect(png.headers()["content-type"]).toBe("image/png");
  const body = await png.body();

  expect([body.readUInt32BE(16), body.readUInt32BE(20)]).toEqual([180, 180]);
});
