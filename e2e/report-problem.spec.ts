import type { Locator, Page, TestInfo } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { expect, test } from "./fixtures";
import { settleAnimations } from "./screenshot";
import { seedAnswer, seedPoll } from "./seed";

const pill = (page: Page) => page.getByRole("button", { name: "Zgłoś problem" });
const reportForm = (page: Page) => page.getByRole("dialog", { name: "Zgłoś problem" });
const isPhone = (testInfo: TestInfo) => testInfo.project.name.startsWith("phone");

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
    const frame = () => new Promise((resolve) => requestAnimationFrame(() => setTimeout(() => requestAnimationFrame(resolve))));
    const rect = (selector: string) => document.querySelector(selector)?.getBoundingClientRect().toJSON() ?? null;
    const steps = [];

    for (let top = 0; top <= document.documentElement.scrollHeight - innerHeight + 40; top += 40) {
      window.scrollTo({ top, behavior: "instant" });
      await frame();
      await frame();

      const bar = rect("[data-bottom-bar]");

      steps.push({
        pill: rect("[data-report-pill] button"),
        pinnedButton: bar && Math.abs(bar.bottom - document.documentElement.clientHeight) <= 1 ? rect("[data-bottom-bar] button") : null,
      });
    }

    return steps;
  });
}

function pillThroughJumps(page: Page) {
  return page.evaluate(async () => {
    const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
    const rect = (selector: string) => document.querySelector(selector)?.getBoundingClientRect().toJSON() ?? null;
    const form = document.querySelector("[data-bottom-bar]")!.closest("form")!.getBoundingClientRect();
    const tops = [];
    const samples = [];

    for (let top = scrollY + form.top - innerHeight; top <= scrollY + form.bottom + 600; top += 600) tops.push(Math.max(0, top));

    for (const top of [...tops, ...tops.toReversed()]) {
      window.scrollTo({ top, behavior: "instant" });

      for (let sample = 0; sample < 4; sample++) {
        await frame();
        const bar = rect("[data-bottom-bar]")!;

        samples.push({
          pill: rect("[data-report-pill] button"),
          pinnedButton: Math.abs(bar.bottom - document.documentElement.clientHeight) <= 1 ? rect("[data-bottom-bar] button") : null,
        });
      }
    }

    return samples;
  });
}

function places(steps: { pill: unknown }[]) {
  return new Set(steps.map((step) => JSON.stringify(step.pill)));
}

function seedLongPoll() {
  const pollId = seedPoll({ dates: ["2031-10-17", "2031-10-18", "2031-10-19", "2031-10-20"], firstHour: 8, hourCount: 14 });

  seedAnswer(pollId, "Zuza", Date.now(), [["2031-10-20", 21]]);

  return pollId;
}

test("the pill stays in view on the landing and clears the sticky create button", async ({ page }, testInfo) => {
  await page.goto("/");

  await expectPillInViewAtTopAndEnd(page);
  await saveViewport(page, testInfo, "report-pill-landing-end");

  if (!isPhone(testInfo)) return;

  const create = page.getByRole("button", { name: "Utwórz i wyślij na grupę" });

  await page.getByRole("textbox", { name: "Co robimy?" }).scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy({ top: 120, behavior: "instant" }));
  await expect(create).toBeInViewport();
  await expect(pill(page)).toBeInViewport();
  await expectPillClear(page, create);
  await saveViewport(page, testInfo, "report-pill-above-create-bar");
});

test("the pill stays still while the landing scrolls and clears the pinned create bar", async ({ page }) => {
  await page.goto("/");

  const steps = await pillWhileScrolling(page);

  expect(places(steps).size).toBe(1);

  for (const { pill: pillBox, pinnedButton } of steps) {
    if (pillBox && pinnedButton) expect(overlap(pillBox, pinnedButton)).toBe(false);
  }
});

test("the pill neither moves nor meets the pinned create button when the landing jumps through the form", async ({ page }, testInfo) => {
  test.skip(!isPhone(testInfo), "the create bar is sticky on the phone only");
  await page.goto("/");

  const samples = await pillThroughJumps(page);

  for (const { pill: pillBox, pinnedButton } of samples) {
    if (pillBox && pinnedButton) expect(overlap(pillBox, pinnedButton)).toBe(false);
  }

  expect(places(samples).size).toBe(1);
});

test("the pill clears the create bar's error when creating fails", async ({ page }, testInfo) => {
  test.skip(!isPhone(testInfo), "the create bar is sticky on the phone only");
  await page.goto("/");
  await page.route("/", (route) => (route.request().method() === "POST" ? route.abort() : route.continue()));
  await page.getByRole("textbox", { name: "Co robimy?" }).fill("Planszówki");
  await page.getByRole("button", { name: "Ten weekend" }).click();
  await page.getByRole("textbox", { name: "Twoje imię" }).fill("Kuba");
  await page.getByRole("button", { name: "Utwórz i wyślij na grupę" }).click();

  const failed = page.getByRole("alert").filter({ hasText: "Nie udało się utworzyć ankiety." });

  await expect(failed).toBeVisible();
  await page.evaluate(() => window.scrollBy({ top: -300, behavior: "instant" }));
  await expectPillClear(page, failed);
  await saveViewport(page, testInfo, "report-pill-above-create-error");
});

test("the pill stays still while the poll page scrolls", async ({ page }) => {
  await page.goto(`/e/${seedLongPoll()}`);
  await expect(page.getByRole("gridcell").first()).toBeVisible();

  expect(places(await pillWhileScrolling(page)).size).toBe(1);
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

  await page.goto("/");
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
  await page.goto("/");
  await pill(page).click();
  await reportForm(page).getByRole("textbox", { name: "Co nie działa?" }).fill("Test z e2e bez klucza Linear");
  await reportForm(page).getByRole("button", { name: "Wyślij zgłoszenie" }).click();

  await expect(reportForm(page).getByRole("alert")).toHaveText("Nie udało się wysłać. Napisz na kontakt@wpasuj.pl.");
  await saveViewport(page, testInfo, "report-failure");
});

test("an empty report shows the field's error", async ({ page }, testInfo) => {
  await page.goto("/");
  await pill(page).click();
  await reportForm(page).getByRole("button", { name: "Wyślij zgłoszenie" }).click();

  await expect(reportForm(page).getByRole("textbox", { name: "Co nie działa?" })).toHaveAccessibleDescription("Napisz, co nie działa");
  await saveViewport(page, testInfo, "report-invalid");
});
