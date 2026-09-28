import { expect, test, type Page } from "@playwright/test";
import { saveScreenshot } from "./screenshot";
import { seedAnswer, seedPoll } from "./seed";

declare global {
  interface Window {
    bumps?: string[];
  }
}

const saturday = "2030-10-19";
const sunday = "2030-10-20";
const minutesAgo = (minutes: number) => Date.now() - minutes * 60_000;

function seedThreeAnswers() {
  const pollId = seedPoll({ dates: [saturday, sunday], firstHour: 17, hourCount: 4 });
  seedAnswer(pollId, "Ola", minutesAgo(120), [[saturday, 17], [saturday, 18], [saturday, 19], [sunday, 19], [sunday, 20]]);
  seedAnswer(pollId, "Bartek", minutesAgo(20), [[saturday, 18], [saturday, 19], [saturday, 20], [sunday, 18]]);
  seedAnswer(pollId, "Kasia", minutesAgo(0), [[saturday, 18], [saturday, 19], [saturday, 20], [sunday, 17], [sunday, 18], [sunday, 19], [sunday, 20]]);
  return pollId;
}

async function openResults(page: Page, pollId: string) {
  await page.goto(`/e/${pollId}`);
  await page.getByRole("tab", { name: "Wszyscy" }).click();
}

const itemsOf = (page: Page, list: string) => page.getByRole("list", { name: list }).getByRole("listitem");

test("three answers agree with a hand count", async ({ page }, testInfo) => {
  const pollId = seedThreeAnswers();

  await openResults(page, pollId);

  const best = page.getByRole("region", { name: "Najlepiej" });
  await expect(best).toContainText("Sobota 19.10, 18–20");
  await expect(best).toContainText("3 z 3 może");
  await expect(best).not.toContainText("Nie może");
  await expect(itemsOf(page, "Też dobre")).toHaveText(["nd 20.10, 19–212 z 3", "sb 19.10, 20–212 z 3"]);
  const handCount: [string, number][] = [
    ["sb 19, 17:00", 1],
    ["sb 19, 18:00", 3],
    ["sb 19, 19:00", 3],
    ["sb 19, 20:00", 2],
    ["nd 20, 17:00", 1],
    ["nd 20, 18:00", 2],
    ["nd 20, 19:00", 2],
    ["nd 20, 20:00", 2],
  ];
  for (const [hour, count] of handCount) {
    await expect(page.getByRole("button", { name: `${hour}, ${count} z 3 może` })).toHaveText(String(count));
  }
  await expect(itemsOf(page, "Kto odpowiedział")).toHaveText(["KKasiaprzed chwilą", "BBartek20 min temu", "OOla2 godz. temu"]);
  await saveScreenshot(page, testInfo, "results-three-answers");

  await page.getByRole("button", { name: "nd 20, 18:00, 2 z 3 może" }).click();

  const details = page.getByRole("region", { name: "Niedziela 20.10, 18:00" });
  await expect(details.getByRole("list", { name: "Mogą", exact: true }).getByRole("listitem")).toHaveText(["BBartek", "KKasia"]);
  await expect(details.getByRole("list", { name: "Nie mogą" }).getByRole("listitem")).toHaveText(["OOla"]);
  await saveScreenshot(page, testInfo, testInfo.project.name.startsWith("desktop") ? "results-side-panel" : "results-sheet");
  await details.getByRole("button", { name: "Zamknij" }).click();
  await expect(details).toBeHidden();
});

test("an answer written elsewhere shows within 10 seconds", async ({ page }) => {
  const pollId = seedThreeAnswers();
  await openResults(page, pollId);
  await expect(page.getByRole("region", { name: "Najlepiej" })).toContainText("3 z 3 może");

  seedAnswer(pollId, "Zosia", Date.now(), []);

  const best = page.getByRole("region", { name: "Najlepiej" });
  await expect(best).toContainText("3 z 4 może", { timeout: 10_000 });
  await expect(best).toContainText("Nie może: Zosia");
  await expect(itemsOf(page, "Kto odpowiedział").first()).toHaveText("ZZosianie może");
});

test("the heatmap lets the page scroll under a finger", async ({ page }) => {
  await openResults(page, seedThreeAnswers());

  const cell = page.getByRole("button", { name: "sb 19, 18:00, 3 z 3 może" });

  await expect(cell.locator("..")).toHaveCSS("touch-action", "auto");
});

test("with nobody answered it asks to send the link", async ({ page }, testInfo) => {
  await openResults(page, seedPoll({ dates: [saturday, sunday], firstHour: 17, hourCount: 4 }));

  await expect(page.getByText("Nikt jeszcze nie odpowiedział. Wyślij link na grupę.")).toBeVisible();
  await saveScreenshot(page, testInfo, "results-empty");
});

test("a fresh answer stays across tab switches", async ({ page }) => {
  const pollId = seedThreeAnswers();
  await openResults(page, pollId);
  seedAnswer(pollId, "Zosia", Date.now(), []);
  const best = page.getByRole("region", { name: "Najlepiej" });
  await expect(best).toContainText("3 z 4 może", { timeout: 10_000 });

  await page.getByRole("tab", { name: "Moje" }).click();
  await page.getByRole("tab", { name: "Wszyscy" }).click();

  await expect(best).toContainText("3 z 4 może");
  await expect(itemsOf(page, "Kto odpowiedział").first()).toHaveText("ZZosianie może");
});

test("a count that rises twice bumps twice", async ({ page }) => {
  await page.addInitScript(() => {
    const animate = Element.prototype.animate;
    window.bumps = [];
    Element.prototype.animate = function (keyframes, options) {
      if (JSON.stringify(keyframes).includes("1.08")) window.bumps!.push(this.getAttribute("aria-label") ?? "");
      return animate.call(this, keyframes, options);
    };
  });
  const pollId = seedThreeAnswers();
  await openResults(page, pollId);
  const cell = (count: number) => page.getByRole("button", { name: `sb 19, 17:00, ${count} z ` });

  seedAnswer(pollId, "Zosia", Date.now(), [[saturday, 17]]);
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(cell(2)).toBeVisible();
  seedAnswer(pollId, "Iga", Date.now(), [[saturday, 17]]);
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(cell(3)).toBeVisible();

  expect(await page.evaluate(() => window.bumps!.filter((label) => label.startsWith("sb 19, 17:00")))).toHaveLength(2);
});

test("the best time leads the page on a phone and sits beside the heatmap on a desktop", async ({ page }, testInfo) => {
  await openResults(page, seedThreeAnswers());
  const best = (await page.getByRole("region", { name: "Najlepiej" }).boundingBox())!;
  const tabs = (await page.getByRole("tablist", { name: "Widok" }).boundingBox())!;
  const grid = (await page.getByRole("grid", { name: "Kto może" }).boundingBox())!;

  if (testInfo.project.name.startsWith("phone")) {
    expect(best.y + best.height).toBeLessThanOrEqual(tabs.y);
    return;
  }
  expect(best.x).toBeGreaterThanOrEqual(grid.x + grid.width);
  expect(best.y).toBeLessThan(tabs.y);
  expect(grid.y - (tabs.y + tabs.height)).toBeLessThan(80);
  await page.getByRole("button", { name: "nd 20, 18:00, 2 z 3 może" }).click();
  const details = (await page.getByRole("region", { name: "Niedziela 20.10, 18:00" }).boundingBox())!;
  expect(details.x).toBe(best.x);
  expect(details.width).toBe(best.width);
  expect(details.y).toBeGreaterThan(best.y + best.height);
  const weekday = page.getByRole("columnheader").first().locator("[data-long]");
  expect(await weekday.evaluate((element) => getComputedStyle(element, "::after").content)).toBe('"sobota"');
});
