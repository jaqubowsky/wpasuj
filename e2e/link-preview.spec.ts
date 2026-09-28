import { expect, test } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { siteUrl } from "../playwright.config";
import { seedPoll } from "./seed";

test.skip(({ browserName, isMobile }) => browserName !== "chromium" || isMobile, "the card is one image, whatever the browser");

function pngSize(png: Buffer) {
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
}

test("the poll page asks the question and points og:image at its card on SITE_URL", async ({ page }) => {
  const pollId = seedPoll({
    dates: ["2030-10-18", "2030-10-19", "2030-10-20"],
    firstHour: 17,
    hourCount: 6,
    title: "Wędrówka: żubry i łąka",
  });

  await page.goto(`/e/${pollId}`);

  await expect(page).toHaveTitle("Kiedy możesz? Wędrówka: żubry i łąka");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", "Kiedy możesz? Wędrówka: żubry i łąka");
  const image = await page.locator('meta[property="og:image"]').getAttribute("content");
  const card = `${siteUrl}/e/${pollId}/opengraph-image`;
  expect(image?.slice(0, card.length)).toBe(card);
  expect(image?.slice(card.length)).toMatch(/^(\?|$)/);
});

test("the card is a 1200×630 PNG under 1 MB", async ({ page, request }) => {
  const pollId = seedPoll({
    dates: ["2030-10-18", "2030-10-19", "2030-10-20"],
    firstHour: 17,
    hourCount: 6,
    title: "Wędrówka: żubry i łąka",
  });
  await page.goto(`/e/${pollId}`);
  const image = new URL((await page.locator('meta[property="og:image"]').getAttribute("content"))!);

  const response = await request.get(image.pathname + image.search);

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toBe("image/png");
  const png = await response.body();
  expect(pngSize(png)).toEqual({ width: 1200, height: 630 });
  expect(png.byteLength).toBeLessThan(1024 * 1024);
  await mkdir("e2e/screenshots", { recursive: true });
  await writeFile("e2e/screenshots/link-preview.png", png);

  await page.setViewportSize({ width: 1200, height: 630 });
  await page.goto(`file://${resolve("spec/design/v2/og.html")}`);
  await page.screenshot({ path: "e2e/screenshots/link-preview-mockup.png" });
});
