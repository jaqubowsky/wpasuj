import type { Browser, Locator, Page, TestInfo } from "@playwright/test";
import { expect, test } from "./fixtures";
import { centreOf, mouseDrag, touchDrag } from "./pointer";
import { settleAnimations } from "./screenshot";
import { seedAnswer, seedPoll } from "./seed";

const dates = ["2031-10-17", "2031-10-18", "2031-10-19"];

function seedBoardPoll() {
  const pollId = seedPoll({ dates, firstHour: 18, hourCount: 4 });

  seedAnswer(pollId, "Ola", Date.now() - 20 * 60_000, [
    [dates[0], 19],
    [dates[1], 19],
    [dates[1], 20],
  ]);

  seedAnswer(pollId, "Bartek", Date.now() - 10 * 60_000, [
    [dates[1], 19],
    [dates[2], 20],
  ]);

  return pollId;
}

async function openAsNewDevice(browser: Browser, pollId: string) {
  const context = await browser.newContext(test.info().project.use);
  const page = await context.newPage();

  await page.goto(`/e/${pollId}`);

  return page;
}

const board = (page: Page) => page.getByRole("grid", { name: "Kiedy możesz?" });

function cellAt(page: Page, hourIndex: number, dateIndex: number) {
  return board(page)
    .getByRole("row")
    .nth(hourIndex + 1)
    .getByRole("button")
    .nth(dateIndex + 1);
}

async function viewportShot(page: Page, testInfo: TestInfo, screen: string, centre: Locator) {
  await centre.evaluate((element) => element.scrollIntoView({ block: "center" }));
  await settleAnimations(page);
  await page.screenshot({ path: `e2e/screenshots/${screen}-${testInfo.project.name}.png` });
}

test("Board: a stroke ripples from its first cell, Zapisane flashes and fades", async ({ browser }, testInfo) => {
  const page = await openAsNewDevice(browser, seedBoardPoll());
  const status = page.getByRole("status");

  await viewportShot(page, testInfo, "board-answer-empty", board(page));

  await page.getByRole("textbox", { name: "Twoje imię" }).fill("Zuza");
  await board(page).evaluate((element) => element.scrollIntoView({ block: "center" }));

  const dragWith = testInfo.project.name === "phone-chromium" ? touchDrag : mouseDrag;

  await dragWith(page, await centreOf(cellAt(page, 0, 0)), await centreOf(cellAt(page, 2, 1)), async () => {
    await expect(page.locator('[data-state="adding"]')).toHaveCount(6);
    await page.screenshot({ path: `e2e/screenshots/board-answer-stroke-${testInfo.project.name}.png` });
  });

  const ripple = await board(page)
    .locator("[data-ripple]")
    .evaluateAll((cells: HTMLElement[]) =>
      cells.map((cell) => [cell.dataset.date, cell.dataset.hour, getComputedStyle(cell).getPropertyValue("--ripple-step")]),
    );

  expect(ripple).toEqual([
    [dates[0], "18", "0"],
    [dates[1], "18", "1"],
    [dates[0], "19", "1"],
    [dates[1], "19", "2"],
    [dates[0], "20", "2"],
    [dates[1], "20", "3"],
  ]);

  await expect(status).toHaveText("Zapisane");
  await expect(status).not.toHaveAttribute("data-faded");
  await viewportShot(page, testInfo, "board-answer-name", page.getByRole("textbox", { name: "Twoje imię" }));

  await expect(status).toHaveAttribute("data-faded");
  await expect(status).toHaveText("Zapisane");
  await expect(board(page).locator("[data-ripple]")).toHaveCount(0);
  await viewportShot(page, testInfo, "board-answer-marked", board(page));
});

test("Board: a tapped hour on Wszyscy rings", async ({ browser }, testInfo) => {
  const page = await openAsNewDevice(browser, seedBoardPoll());

  await page.getByRole("tab", { name: "Wszyscy" }).click();

  const hour = page.getByRole("grid", { name: "Kto może" }).getByRole("button", { name: /^sb 18, 19:00/ });

  await hour.evaluate((element) => element.scrollIntoView({ block: "center" }));
  if (testInfo.project.use.hasTouch) await hour.tap();
  else await hour.click();

  await expect(hour).toHaveAttribute("data-selected");
  await settleAnimations(page);
  await page.screenshot({ path: `e2e/screenshots/board-results-selected-${testInfo.project.name}.png` });
});
