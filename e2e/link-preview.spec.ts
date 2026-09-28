import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { siteUrl } from "../playwright.config";
import { seedAnswer, seedPoll } from "./seed";

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
  await writeFile("e2e/screenshots/link-preview-no-answers.png", png);
});

async function cardOf(page: Page, request: APIRequestContext, pollId: string) {
  await page.goto(`/e/${pollId}`);
  const image = new URL((await page.locator('meta[property="og:image"]').getAttribute("content"))!);

  return (await request.get(image.pathname + image.search)).body();
}

type Band = { x: number; y: number; width: number; height: number };

const bands = {
  organiser: { x: 72, y: 56, width: 1056, height: 36 },
  title: { x: 72, y: 110, width: 1056, height: 84 },
  days: { x: 72, y: 232, width: 1056, height: 40 },
  hours: { x: 72, y: 286, width: 1056, height: 40 },
  respondents: { x: 72, y: 516, width: 820, height: 68 },
  wordmark: { x: 960, y: 530, width: 168, height: 44 },
};

async function pixelsIn(page: Page, png: Buffer, band: Band) {
  const pixels = await page.evaluate(
    async ({ source, band }) => {
      const bitmap = await createImageBitmap(await (await fetch(source)).blob());
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const context = canvas.getContext("2d")!;

      context.drawImage(bitmap, 0, 0);

      return Array.from(context.getImageData(band.x, band.y, band.width, band.height).data).join(",");
    },
    { source: `data:image/png;base64,${png.toString("base64")}`, band },
  );

  return { digest: createHash("sha256").update(pixels).digest("hex"), colours: new Set(pixels.match(/\d+,\d+,\d+,\d+/g)).size };
}

const kino = { dates: ["2030-10-18", "2030-10-19", "2030-10-20"], firstHour: 17, hourCount: 6, title: "Kino u Oli", organiserName: "Kuba" };

test("each fact on the card draws in its own band: organiser, title, dates, hours, respondents", async ({ page, request }) => {
  const base = await cardOf(page, request, seedPoll(kino));
  const answered = seedPoll(kino);

  ["Ola", "Michał", "Zośka"].forEach((name, index) => seedAnswer(answered, name, Date.now() + index, []));

  const variants = {
    organiser: await cardOf(page, request, seedPoll({ ...kino, organiserName: "Zośka" })),
    title: await cardOf(page, request, seedPoll({ ...kino, title: "Mecz u Oli" })),
    days: await cardOf(page, request, seedPoll({ ...kino, dates: ["2030-10-25", "2030-10-26", "2030-10-27"] })),
    hours: await cardOf(page, request, seedPoll({ ...kino, firstHour: 8, hourCount: 4 })),
    respondents: await cardOf(page, request, answered),
  };

  await mkdir("e2e/screenshots", { recursive: true });
  await writeFile("e2e/screenshots/link-preview-answers.png", variants.respondents);

  for (const [fact, card] of Object.entries(variants)) {
    for (const [name, band] of Object.entries(bands)) {
      const [before, after] = [await pixelsIn(page, base, band), await pixelsIn(page, card, band)];

      expect(before.colours, `${name} draws something`).toBeGreaterThan(1);
      if (name === fact) expect(after.digest, `${fact} changes its band`).not.toBe(before.digest);
      else expect(after.digest, `${fact} leaves ${name} alone`).toBe(before.digest);
    }
  }
});

const sixtyCharacters = "Rowerem dookoła Mazur, nocleg pod namiotem, ognisko nad wodą";

const tenDates = [
  "2030-10-01",
  "2030-10-03",
  "2030-10-05",
  "2030-10-07",
  "2030-10-09",
  "2030-10-11",
  "2030-10-13",
  "2030-10-15",
  "2030-10-17",
  "2030-10-19",
];

const thirtyNames = [
  "Ola",
  "Michał",
  "Zośka",
  "Bartłomiej",
  "Łucja",
  "Ślęzak Grzegorz",
  "Kasia",
  "Piotrek",
  "Żaneta",
  "Jędrzej",
  "Małgorzata Wiśniewska",
  "Tomek",
  "Agnieszka",
  "Wojtek",
  "Ewa",
  "Szymon",
  "Natalia",
  "Kuba",
  "Iga",
  "Paweł",
  "Ania",
  "Krzysiek",
  "Dominika",
  "Maciek",
  "Julia",
  "Filip",
  "Hania",
  "Staś",
  "Weronika",
  "Adam",
];

const margin = 40;

const frame = [
  { x: 0, y: 0, width: 1200, height: margin },
  { x: 0, y: 630 - margin, width: 1200, height: margin },
  { x: 0, y: 0, width: margin, height: 630 },
  { x: 1200 - margin, y: 0, width: margin, height: 630 },
];

test("a 60-character title with ten dates and 30 respondents stays inside the card", async ({ page, request }) => {
  expect(sixtyCharacters).toHaveLength(60);

  const long = seedPoll({
    dates: tenDates,
    firstHour: 8,
    hourCount: 5,
    title: sixtyCharacters,
    organiserName: "Małgorzata Żółkiewska-Ślęczkowska",
  });

  thirtyNames.forEach((name, index) => seedAnswer(long, name, Date.now() + index, []));

  const [shortCard, longCard] = [await cardOf(page, request, seedPoll(kino)), await cardOf(page, request, long)];

  await mkdir("e2e/screenshots", { recursive: true });
  await writeFile("e2e/screenshots/link-preview-long.png", longCard);

  expect(pngSize(longCard)).toEqual({ width: 1200, height: 630 });
  expect(longCard.byteLength).toBeLessThan(1024 * 1024);
  for (const edge of frame) expect((await pixelsIn(page, longCard, edge)).colours).toBe(1);
  expect((await pixelsIn(page, longCard, bands.wordmark)).digest).toBe((await pixelsIn(page, shortCard, bands.wordmark)).digest);
});

test("the poll page asks search engines not to index or follow it, while robots.txt lets them read that", async ({ page, request }) => {
  const pollId = seedPoll({ dates: ["2030-10-18"], firstHour: 17, hourCount: 6, title: "Kino u Oli" });

  await page.goto(`/e/${pollId}`);

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
  expect(await (await request.get("/robots.txt")).text()).not.toContain("Disallow: /e/");
});
