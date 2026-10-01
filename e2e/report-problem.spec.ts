import type { Locator, Page, TestInfo } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { expect, test } from "./fixtures";
import { settleAnimations } from "./screenshot";
import { seedAnswer, seedPoll } from "./seed";

const pill = (page: Page) => page.getByRole("button", { name: "Zgłoś problem" });
const reportForm = (page: Page) => page.getByRole("dialog", { name: "Zgłoś problem" });
const createButton = (page: Page) => page.getByRole("button", { name: "Utwórz i wyślij na grupę" });
const isPhone = (testInfo: TestInfo) => testInfo.project.name.startsWith("phone");
const cornerGap = 16;
const roomForPill = 76;

async function box(locator: Locator) {
  const found = await locator.boundingBox();

  expect(found).not.toBeNull();

  return found!;
}

function overlap(a: { x: number; y: number; width: number; height: number }, b: typeof a) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

async function scrollToEnd(page: Page) {
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
  await page.waitForFunction(() => Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight);
}

async function settledPill(page: Page) {
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await settleAnimations(page);

  return page.evaluate(() => {
    const corner = document.querySelector("[data-report-pill]")!;
    const button = corner.querySelector("button")!.getBoundingClientRect();
    const style = getComputedStyle(corner);

    return {
      hidden: style.opacity === "0" && style.pointerEvents === "none",
      tapped: document.elementFromPoint(button.x + button.width / 2, button.y + button.height / 2)?.closest("button")?.textContent,
    };
  });
}

async function expectPillTappable(page: Page) {
  expect(await settledPill(page)).toEqual({ hidden: false, tapped: "Zgłoś problem" });
}

async function expectPillOutOfTheWay(page: Page, others: Locator[]) {
  if ((await settledPill(page)).hidden) return;

  const pillBox = await box(pill(page));

  for (const other of others) {
    const otherBox = await other.boundingBox();

    if (otherBox) expect(overlap(pillBox, otherBox), `pill over ${await other.textContent()}`).toBe(false);
  }
}

async function expectPillClear(page: Page, others: Locator) {
  const pillBox = await box(pill(page));

  for (const other of await others.all()) {
    const otherBox = await other.boundingBox();

    if (otherBox) expect(overlap(pillBox, otherBox), `pill over ${await other.getAttribute("aria-label")}`).toBe(false);
  }
}

async function expectPillInViewAtTopAndEnd(page: Page) {
  await expect(pill(page)).toBeInViewport();
  await scrollToEnd(page);
  await expect(pill(page)).toBeInViewport();

  const contentEnd = await page.locator("[data-report-room]").evaluate((room) => room.getBoundingClientRect().top);

  expect((await box(pill(page))).y).toBeGreaterThanOrEqual(contentEnd);
}

async function saveViewport(page: Page, testInfo: TestInfo, screen: string) {
  await settleAnimations(page);
  await page.screenshot({ path: `e2e/screenshots/${screen}-${testInfo.project.name}.png` });
}

function pillWhileScrolling(page: Page) {
  return page.evaluate(async () => {
    const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
    const steps = [];

    for (let top = 0; top <= document.documentElement.scrollHeight - innerHeight + 40; top += 40) {
      window.scrollTo({ top, behavior: "instant" });
      await frame();

      const corner = document.querySelector("[data-report-pill]")!;

      steps.push({
        pill: corner.querySelector("button")!.getBoundingClientRect().toJSON(),
        viewportBottom: document.documentElement.clientHeight,
        hidden: getComputedStyle(corner).pointerEvents === "none",
      });
    }

    return steps;
  });
}

function pillThroughJumps(page: Page) {
  return page.evaluate(async () => {
    const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
    const form = document.querySelector("form [data-report-pill-clear]")!.closest("form")!.getBoundingClientRect();
    const tops = [];
    const samples = [];

    for (let top = scrollY + form.top - innerHeight; top <= scrollY + form.bottom + 600; top += 600) tops.push(Math.max(0, top));

    for (const top of [...tops, ...tops.toReversed()]) {
      window.scrollTo({ top, behavior: "instant" });
      await frame();
      await frame();

      const corner = document.querySelector("[data-report-pill]")!;

      samples.push({
        top,
        pill: corner.querySelector("button")!.getBoundingClientRect().toJSON(),
        hidden: getComputedStyle(corner).pointerEvents === "none",
        createButton: document.querySelector("form [data-report-pill-clear] button")!.getBoundingClientRect().toJSON(),
      });
    }

    return samples;
  });
}

function places(steps: { pill: unknown }[]) {
  return new Set(steps.map((step) => JSON.stringify(step.pill)));
}

async function openLandingWithPillClear(page: Page) {
  await page.goto("/");
  await page.evaluate(() => window.scrollBy({ top: 160, behavior: "instant" }));
  await expectPillTappable(page);
}

function seedLongPoll() {
  const pollId = seedPoll({ dates: ["2031-10-17", "2031-10-18", "2031-10-19", "2031-10-20"], firstHour: 8, hourCount: 14 });

  seedAnswer(pollId, "Zuza", Date.now(), [["2031-10-20", 21]]);

  return pollId;
}

test("the pill is tappable at the landing's footer, on the hero at 1440, and the page ends in room for the pill alone", async ({
  page,
}, testInfo) => {
  await page.goto("/");

  if (!isPhone(testInfo)) await expectPillTappable(page);

  await expectPillInViewAtTopAndEnd(page);
  await expectPillTappable(page);
  expect(await page.locator("[data-report-room]").evaluate((room) => room.getBoundingClientRect().height)).toBe(roomForPill);
  await saveViewport(page, testInfo, "report-pill-landing-end");
});

test("at 390×664 the pill hides over the hero's create button and comes back once the button scrolls above it", async ({
  page,
}, testInfo) => {
  test.skip(!isPhone(testInfo), "the pill hides on the phone only");
  await page.setViewportSize({ width: 390, height: 664 });
  await page.goto("/");

  const heroCreate = page.locator("[data-hero]").getByRole("button", { name: "Utwórz ankietę" });

  expect(overlap(await box(pill(page)), await box(heroCreate))).toBe(true);
  expect((await settledPill(page)).hidden).toBe(true);
  await saveViewport(page, testInfo, "report-pill-over-hero-create");
  await page.evaluate(() => window.scrollBy({ top: 160, behavior: "instant" }));
  await expectPillTappable(page);
  expect(overlap(await box(pill(page)), await box(heroCreate))).toBe(false);
  await saveViewport(page, testInfo, "report-pill-landing-hero");
});

test("the pill keeps its corner while the landing scrolls", async ({ page }, testInfo) => {
  test.slow(true, "a frame per 40px step over the whole landing");
  await page.goto("/");

  const steps = await pillWhileScrolling(page);

  expect(places(steps).size).toBe(1);
  expect(steps[0].viewportBottom - steps[0].pill.bottom).toBe(cornerGap);

  if (!isPhone(testInfo)) expect(steps.filter((step) => step.hidden)).toEqual([]);
});

test("the pill hides under the pinned create bar and a tap there creates the poll", async ({ page }, testInfo) => {
  test.skip(!isPhone(testInfo), "the create bar is sticky on the phone only");
  await page.goto("/");
  await page.getByText("Kiedy?").scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy({ top: 120, behavior: "instant" }));

  const bar = await box(page.locator("form [data-report-pill-clear]"));

  expect(bar.y + bar.height).toBe(page.viewportSize()!.height);
  expect(await settledPill(page)).toEqual({ hidden: true, tapped: "Utwórz i wyślij na grupę" });
  await saveViewport(page, testInfo, "report-pill-under-create-bar");
});

test("two frames after each jump through the form the pill is hidden or clear of the create button", async ({ page }, testInfo) => {
  test.skip(!isPhone(testInfo), "the create bar is sticky on the phone only");
  await page.goto("/");

  const samples = await pillThroughJumps(page);

  expect(places(samples).size).toBe(1);

  for (const { top, pill: pillBox, hidden, createButton: button } of samples) {
    if (!hidden) expect(overlap(pillBox, button), `pill on the create button at ${top}`).toBe(false);
  }
});

test("the pill clears the create bar's error when creating fails", async ({ page }, testInfo) => {
  test.skip(!isPhone(testInfo), "the create bar is sticky on the phone only");
  await page.goto("/");
  await page.route("/", (route) => (route.request().method() === "POST" ? route.abort() : route.continue()));
  await page.getByRole("textbox", { name: "Co robimy?" }).fill("Planszówki");
  await page.getByRole("button", { name: "Ten weekend" }).click();
  await page.getByRole("textbox", { name: "Twoje imię" }).fill("Kuba");
  await createButton(page).click();

  const failed = page.getByRole("alert").filter({ hasText: "Nie udało się utworzyć ankiety." });

  await expect(failed).toBeVisible();
  await page.evaluate(() => window.scrollBy({ top: -300, behavior: "instant" }));
  await expectPillOutOfTheWay(page, [failed, createButton(page)]);
  await saveViewport(page, testInfo, "report-pill-create-error");
});

test("the pill stays still and visible while the poll page scrolls", async ({ page }) => {
  await page.goto(`/e/${seedLongPoll()}`);
  await expect(page.getByRole("gridcell").first()).toBeVisible();

  const steps = await pillWhileScrolling(page);

  expect(places(steps).size).toBe(1);
  expect(steps.filter((step) => step.hidden)).toEqual([]);
});

for (const tab of ["Moje", "Wszyscy"] as const) {
  test(`the pill stays in view on the poll page and clears every grid cell at the end on ${tab}`, async ({ page }, testInfo) => {
    await page.goto(`/e/${seedLongPoll()}`);
    await page.getByRole("tab", { name: tab }).click();
    await expect(page.getByRole("gridcell").first()).toBeVisible();

    await expectPillInViewAtTopAndEnd(page);
    await expectPillClear(page, page.getByRole("gridcell"));
    await saveViewport(page, testInfo, `report-pill-poll-end-${tab.toLowerCase()}`);
  });
}

test("the pill stays in view on the error page", async ({ page }) => {
  await page.goto(`/dev/error?run=${randomUUID()}`);
  await expect(page.getByRole("heading", { name: "Coś poszło nie tak" })).toBeVisible();

  await expectPillInViewAtTopAndEnd(page);
});

test("the pill stays in view on the gone-poll page", async ({ page }) => {
  await page.goto("/e/AAAAAAAAAA");
  await expect(page.getByRole("heading", { name: "Tej ankiety już nie ma" })).toBeVisible();

  await expectPillInViewAtTopAndEnd(page);
});

test("the pill opens the form, shows it sending and thanks the reporter", async ({ page }, testInfo) => {
  let release = () => {};
  const held = new Promise<void>((resolve) => (release = resolve));

  await page.route("**/*", async (route) => {
    if (route.request().headers()["next-action"]) await held;

    await route.continue();
  });

  await openLandingWithPillClear(page);
  await saveViewport(page, testInfo, "report-closed");

  await pill(page).click();
  await expect(reportForm(page)).toBeVisible();
  await saveViewport(page, testInfo, "report-open");
  await reportForm(page).getByRole("textbox", { name: "Co nie działa?" }).fill("Test z e2e, zatrzymany na pułapce");
  await reportForm(page).locator("input[name=website]").fill("https://bot.example", { force: true });
  await reportForm(page).getByRole("button", { name: "Wyślij zgłoszenie" }).click();

  await expect(reportForm(page).getByRole("button", { name: "Wysyłam…" })).toBeVisible();
  await saveViewport(page, testInfo, "report-sending");
  release();
  await expect(page.getByRole("status").filter({ hasText: "Dzięki, zgłoszenie dotarło." })).toBeVisible();
  await expect(reportForm(page)).toHaveCount(0);
  await saveViewport(page, testInfo, "report-success");
});

test("without a Linear key the form points to the e-mail address", async ({ page }, testInfo) => {
  await openLandingWithPillClear(page);
  await pill(page).click();
  await reportForm(page).getByRole("textbox", { name: "Co nie działa?" }).fill("Test z e2e bez klucza Linear");
  await reportForm(page).getByRole("button", { name: "Wyślij zgłoszenie" }).click();

  await expect(reportForm(page).getByRole("alert")).toHaveText("Nie udało się wysłać. Napisz na kontakt@wpasuj.pl.");
  await saveViewport(page, testInfo, "report-failure");
});

test("an empty report shows the field's error", async ({ page }, testInfo) => {
  await openLandingWithPillClear(page);
  await pill(page).click();
  await reportForm(page).getByRole("button", { name: "Wyślij zgłoszenie" }).click();

  await expect(reportForm(page).getByRole("textbox", { name: "Co nie działa?" })).toHaveAccessibleDescription("Napisz, co nie działa");
  await saveViewport(page, testInfo, "report-invalid");
});
