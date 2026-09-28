import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
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

async function cardOf(page: Page, request: APIRequestContext, pollId: string) {
  await page.goto(`/e/${pollId}`);
  const image = new URL((await page.locator('meta[property="og:image"]').getAttribute("content"))!);
  return (await request.get(image.pathname + image.search)).body();
}

const wordmarkBand = { x: 72, y: 548, width: 640, height: 38 };

function pixelsIn(page: Page, png: Buffer) {
  return page.evaluate(async ({ source, band }) => {
    const bitmap = await createImageBitmap(await (await fetch(source)).blob());
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const context = canvas.getContext("2d")!;
    context.drawImage(bitmap, 0, 0);
    return Array.from(context.getImageData(band.x, band.y, band.width, band.height).data).join(",");
  }, { source: `data:image/png;base64,${png.toString("base64")}`, band: wordmarkBand });
}

const sixtyCharacters = "Rowerem dookoła Mazur, nocleg pod namiotem, ognisko nad wodą";

test("a 60-character title with ten dates leaves the wordmark untouched", async ({ page, request }) => {
  expect(sixtyCharacters).toHaveLength(60);
  const short = seedPoll({ dates: ["2030-10-18"], firstHour: 17, hourCount: 6, title: "Kino" });
  const long = seedPoll({
    dates: ["2030-10-01", "2030-10-03", "2030-10-05", "2030-10-07", "2030-10-09", "2030-10-11", "2030-10-13", "2030-10-15", "2030-10-17", "2030-10-19"],
    firstHour: 8,
    hourCount: 5,
    title: sixtyCharacters,
  });

  const [shortCard, longCard] = [await cardOf(page, request, short), await cardOf(page, request, long)];
  await mkdir("e2e/screenshots", { recursive: true });
  await writeFile("e2e/screenshots/link-preview-long.png", longCard);

  const wordmark = await pixelsIn(page, shortCard);
  expect(new Set(wordmark.match(/\d+,\d+,\d+,\d+/g)).size).toBeGreaterThan(1);
  expect(await pixelsIn(page, longCard)).toBe(wordmark);
});

test("the poll page asks search engines not to index or follow it, while robots.txt lets them read that", async ({ page, request }) => {
  const pollId = seedPoll({ dates: ["2030-10-18"], firstHour: 17, hourCount: 6, title: "Kino u Oli" });

  await page.goto(`/e/${pollId}`);

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
  expect(await (await request.get("/robots.txt")).text()).not.toContain("Disallow: /e/");
});
