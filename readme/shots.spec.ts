import { devices, expect, test, type Browser, type Locator, type Page } from "@playwright/test";
import { randomBytes } from "node:crypto";
import { mkdirSync, statSync } from "node:fs";
import sharp from "sharp";
import { settleAnimations } from "../e2e/screenshot";
import { seedAnswer, seedPoll } from "../e2e/seed";

const out = "docs/readme";
const title = "Grill na działce u Oli";
const organiserToken = randomBytes(32).toString("base64url");

const phone = { ...devices["iPhone 13"], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 };
const desktop = { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 };

type Screen = typeof phone | typeof desktop;

const warsawDate = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Warsaw" });
const dayMs = 86_400_000;
const today = new Date();
const daysToFriday = (5 - today.getDay() + 7) % 7 || 7;
const [friday, saturday, sunday] = [0, 1, 2].map((day) => warsawDate.format(new Date(today.getTime() + (daysToFriday + day) * dayMs)));

const answers: [string, [string, number][]][] = [
  [
    "Ola",
    [
      [friday, 19],
      [friday, 20],
      [saturday, 17],
      [saturday, 18],
      [saturday, 19],
      [saturday, 20],
      [sunday, 16],
      [sunday, 17],
    ],
  ],
  [
    "Kuba",
    [
      [saturday, 18],
      [saturday, 19],
      [saturday, 20],
      [sunday, 16],
      [sunday, 17],
      [sunday, 18],
    ],
  ],
  [
    "Michał",
    [
      [friday, 20],
      [friday, 21],
      [saturday, 18],
      [saturday, 19],
      [saturday, 20],
      [saturday, 21],
    ],
  ],
  [
    "Zuza",
    [
      [friday, 19],
      [friday, 20],
      [friday, 21],
      [saturday, 19],
      [saturday, 20],
      [sunday, 17],
    ],
  ],
  [
    "Bartek",
    [
      [saturday, 16],
      [saturday, 17],
      [saturday, 18],
      [saturday, 19],
      [sunday, 16],
      [sunday, 17],
    ],
  ],
];

function seedGrill(final?: { date: string; firstHour: number; lastHour: number }) {
  const pollId = seedPoll({
    dates: [friday, saturday, sunday],
    firstHour: 16,
    hourCount: 6,
    title,
    organiserName: "Ola",
    organiserToken,
    final,
  });

  const tokens = new Map(
    answers.map(([name, cells], index) => [name, seedAnswer(pollId, name, Date.now() - (5 - index) * 3_600_000, cells)]),
  );

  return { pollId, tokens };
}

async function open(browser: Browser, screen: Screen, path: string, cookies: Record<string, string> = {}) {
  const context = await browser.newContext({ ...test.info().project.use, ...screen });

  await context.addCookies(Object.entries(cookies).map(([name, value]) => ({ name, value, url: "http://localhost:3000" })));

  const page = await context.newPage();

  await page.goto(path);

  return page;
}

async function scrollToTop(target: Locator, gap: number) {
  await target.evaluate((element, offset) => window.scrollBy(0, element.getBoundingClientRect().top - offset), gap);
}

function expectUnderSizeCap(path: string) {
  expect(statSync(path).size).toBeLessThan(300_000);
}

async function animationsDone(page: Page) {
  await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0);
}

async function savePng(image: Buffer, name: string) {
  await sharp(image).png({ palette: true, quality: 80, effort: 10, compressionLevel: 9 }).toFile(`${out}/${name}.png`);
  expectUnderSizeCap(`${out}/${name}.png`);
}

async function shot(page: Page, name: string) {
  await settleAnimations(page);
  await savePng(await page.screenshot(), name);
  await page.context().close();
}

let openPoll: ReturnType<typeof seedGrill>;
let settledPoll: ReturnType<typeof seedGrill>;

test.beforeAll(() => {
  mkdirSync(out, { recursive: true });
  openPoll = seedGrill();
  settledPoll = seedGrill({ date: saturday, firstHour: 19, lastHour: 21 });
});

test("landing", async ({ browser }) => {
  const page = await open(browser, desktop, "/");

  await page.getByRole("region", { name: "Kiedy się widzimy na grillu?" }).getByRole("button", { name: "Utwórz ankietę" }).waitFor();
  await shot(page, "landing-1440");
});

test("mark", async ({ browser }) => {
  const page = await open(browser, { ...desktop, deviceScaleFactor: 8 }, "/");
  const mark = page.getByRole("button", { name: "Wpasuj, na górę strony" }).first().locator("span[aria-hidden]");

  await mark.evaluate((element) => {
    for (let node = element.parentElement; node; node = node.parentElement) node.style.background = "transparent";
  });

  await savePng(await mark.screenshot({ omitBackground: true }), "mark");
  await page.context().close();
});

test("create", async ({ browser }) => {
  const page = await open(browser, phone, "/");
  const form = page.getByRole("region", { name: "Twoja kolej" });

  await form.getByRole("textbox", { name: "Co robimy?" }).fill(title);
  await form.getByRole("button", { name: "Ten weekend" }).click();
  await form.getByRole("textbox", { name: "Twoje imię" }).fill("Ola");
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await scrollToTop(form.getByRole("heading", { name: "Twoja kolej" }), 80);
  await shot(page, "create-390");
});

for (const [screen, width] of [
  [phone, 390],
  [desktop, 1440],
] as const) {
  test(`answer ${width}`, async ({ browser }) => {
    const page = await open(browser, screen, `/e/${openPoll.pollId}`, { [openPoll.pollId]: openPoll.tokens.get("Zuza")! });

    await page.getByRole("tab", { name: "Moje" }).click();
    await page.getByRole("grid", { name: "Kiedy możesz?" }).getByRole("gridcell", { selected: true }).first().waitFor();
    await animationsDone(page);
    await scrollToTop(page.getByRole("tablist"), 80);
    await shot(page, `answer-${width}`);
  });

  test(`results ${width}`, async ({ browser }) => {
    const page = await open(browser, screen, `/e/${openPoll.pollId}`, {
      [openPoll.pollId]: openPoll.tokens.get("Ola")!,
      [`${openPoll.pollId}-org`]: organiserToken,
    });

    const best = page.getByRole("region", { name: "Najlepiej teraz" });

    await page.getByRole("tab", { name: "Wszyscy" }).click();
    await best.waitFor();
    await animationsDone(page);
    if (screen === phone) await scrollToTop(best, 72);

    await shot(page, `results-${width}`);
  });

  test(`settled ${width}`, async ({ browser }) => {
    const page = await open(browser, screen, `/e/${settledPoll.pollId}`, { [settledPoll.pollId]: settledPoll.tokens.get("Zuza")! });

    await page.getByRole("region", { name: "Termin" }).waitFor();
    await shot(page, `settled-${width}`);
  });
}

test("link card", async ({ browser }) => {
  const page = await open(browser, desktop, `/e/${openPoll.pollId}`);
  const card = new URL((await page.locator('meta[property="og:image"]').getAttribute("content"))!);

  await savePng(await (await page.request.get(card.pathname)).body(), "link-card");
  await page.context().close();
});

test("drag", async ({ browser }) => {
  const page = await open(browser, desktop, `/e/${openPoll.pollId}`);
  const grid = page.getByRole("grid", { name: "Kiedy możesz?" });

  const cell = (hour: number, date: number) =>
    grid
      .getByRole("row")
      .nth(hour + 1)
      .getByRole("button")
      .nth(date + 1);

  await page.getByRole("textbox", { name: "Twoje imię" }).fill("Ania");
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await scrollToTop(page.getByRole("tablist"), 80);
  await settleAnimations(page);

  const tabs = (await page.getByRole("tablist").boundingBox())!;
  const ledge = (await page.getByRole("button", { name: "Nie mogę w żadnym terminie" }).boundingBox())!;
  const top = Math.round(tabs.y - 24);

  const clip = {
    left: Math.round(tabs.x - 24),
    top,
    width: Math.round(tabs.width + 48),
    height: Math.round(ledge.y + ledge.height + 40) - top,
  };

  const from = (await cell(3, 0).boundingBox())!;
  const to = (await cell(5, 1).boundingBox())!;
  const session = await page.context().newCDPSession(page);
  const frames: { data: string; at: number }[] = [];

  session.on("Page.screencastFrame", ({ data, metadata, sessionId }) => {
    frames.push({ data, at: metadata.timestamp! * 1000 });
    void session.send("Page.screencastFrameAck", { sessionId });
  });

  await session.send("Page.startScreencast", { format: "png", everyNthFrame: 1 });
  await page.waitForTimeout(800);
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();

  for (let step = 1; step <= 16; step++) {
    await page.mouse.move(
      from.x + from.width / 2 + ((to.x - from.x) * step) / 16,
      from.y + from.height / 2 + ((to.y - from.y) * step) / 16,
    );

    await page.waitForTimeout(50);
  }

  await page.mouse.up();
  await page.getByRole("status").filter({ hasText: "Zapisane" }).waitFor();
  await page.waitForTimeout(1600);
  await session.send("Page.stopScreencast");

  const kept: { image: Buffer; at: number }[] = [];

  for (const { data, at } of frames) {
    const image = await sharp(Buffer.from(data, "base64")).extract(clip).resize(480).png().toBuffer();
    const last = kept.at(-1);

    if (!last || (at - last.at >= 40 && !image.equals(last.image))) kept.push({ image, at });
  }

  const delay = kept.map(({ at }, index) => (kept[index + 1] ? Math.round((kept[index + 1]!.at - at) / 10) * 10 : 2000));

  await sharp(
    kept.map(({ image }) => image),
    { join: { animated: true } },
  )
    .gif({ delay, loop: 0, effort: 10, reuse: true, colours: 32, dither: 0 })
    .toFile(`${out}/drag.gif`);

  expectUnderSizeCap(`${out}/drag.gif`);

  await page.context().close();
});
