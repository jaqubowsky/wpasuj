import type { Browser, Locator, Page, Request, TestInfo } from "@playwright/test";
import { expect, test } from "./fixtures";
import { centresOf, mouseDrag, touchHoldDrag } from "./pointer";
import { saveScreenshot } from "./screenshot";
import { seedAnswer, seedPoll } from "./seed";

async function createPoll(browser: Browser) {
  const organiser = await browser.newPage();

  await organiser.addInitScript(() => {
    Object.defineProperty(navigator, "share", { configurable: true, value: async () => {} });
  });

  await organiser.goto("/");
  await organiser.getByRole("textbox", { name: "Co robimy?" }).fill("Planszówki u Michała");
  await organiser.getByRole("button", { name: "Przyszły tydzień" }).click();
  await organiser.getByRole("textbox", { name: "Twoje imię" }).fill("Kuba");
  await organiser.getByRole("button", { name: "Utwórz i wyślij na grupę" }).click();
  await expect(organiser).toHaveURL(/\/e\/[A-Za-z0-9_-]{10}$/);

  return { organiser, link: organiser.url() };
}

async function openAsNewDevice(browser: Browser, link: string) {
  const context = await browser.newContext(test.info().project.use);
  const page = await context.newPage();

  await page.goto(link);

  return page;
}

const nameField = (page: Page) => page.getByRole("textbox", { name: "Twoje imię" });
const status = (page: Page) => page.getByRole("status");
const selected = (page: Page) => page.getByRole("gridcell", { selected: true });
const cantButton = (page: Page) => page.getByRole("button", { name: "Nie mogę w żadnym terminie" });
const invitation = (page: Page) => page.getByRole("link", { name: "Też coś planujesz? Zrób własną ankietę" });

function cellAt(page: Page, hourIndex: number, dateIndex: number) {
  return page
    .getByRole("grid", { name: "Kiedy możesz?" })
    .getByRole("row")
    .nth(hourIndex + 1)
    .getByRole("button")
    .nth(dateIndex + 1);
}

async function drag(page: Page, testInfo: TestInfo, from: Locator, to: Locator, beforeRelease?: () => Promise<void>) {
  const dragWith = testInfo.project.name === "phone-chromium" ? touchHoldDrag : mouseDrag;

  await dragWith(page, ...(await centresOf(from, to)), beforeRelease);
}

async function tap(cell: Locator, testInfo: TestInfo) {
  if (testInfo.project.use.hasTouch) await cell.tap();
  else await cell.click();
}

test("a fresh participant answers with a name and one drag and sees Zapisane", async ({ browser }, testInfo) => {
  const { link } = await createPoll(browser);
  const page = await openAsNewDevice(browser, link);

  await expect(page.getByRole("tab", { name: "Moje", selected: true })).toBeVisible();
  await expect(nameField(page)).toBeFocused();
  await saveScreenshot(page, testInfo, "answer-empty");

  await nameField(page).fill("Zuza");

  await drag(page, testInfo, cellAt(page, 1, 0), cellAt(page, 3, 2), async () => {
    const shades = await page
      .locator('[data-state="adding"]')
      .evaluateAll((cells) => cells.map((cell) => getComputedStyle(cell).backgroundColor));

    expect(shades).toHaveLength(9);
    expect(new Set(shades).size).toBe(1);
    await saveScreenshot(page, testInfo, "answer-painting");
  });

  await expect(status(page)).toHaveText("Zapisane");
  await expect(selected(page)).toHaveCount(9);
  await saveScreenshot(page, testInfo, "answer-zapisane");

  await page.reload();
  await expect(page.getByRole("tab", { name: "Wszyscy", selected: true })).toBeVisible();
  await page.getByRole("tab", { name: "Moje" }).click();
  await expect(nameField(page)).toHaveValue("Zuza");
  await expect(selected(page)).toHaveCount(9);
});

test("a drag, held first on touch, marks its hours under the hint for this pointer", async ({ browser }, testInfo) => {
  const { link } = await createPoll(browser);
  const page = await openAsNewDevice(browser, link);

  await nameField(page).fill("Zuza");
  await drag(page, testInfo, cellAt(page, 1, 0), cellAt(page, 3, 0));

  await expect(status(page)).toHaveText("Zapisane");
  await expect(selected(page)).toHaveCount(3);

  await expect(page.getByText(/^Kliknij godziny/)).toHaveText(
    testInfo.project.use.hasTouch
      ? "Kliknij godziny, kiedy możesz. Przytrzymaj, żeby przeciągnąć."
      : "Kliknij godziny, kiedy możesz. Możesz przeciągnąć.",
    { useInnerText: true },
  );

  await page.getByText(/^Kliknij godziny/).evaluate((element) => element.scrollIntoView({ block: "start" }));
  await page.screenshot({ path: `e2e/screenshots/answer-after-drag-viewport-${testInfo.project.name}.png` });
});

test("a fresh participant answers with taps only", async ({ browser }, testInfo) => {
  const { link } = await createPoll(browser);
  const page = await openAsNewDevice(browser, link);

  await nameField(page).fill("Bartek");
  await tap(cellAt(page, 0, 0), testInfo);
  await tap(cellAt(page, 2, 1), testInfo);
  await tap(cellAt(page, 4, 2), testInfo);

  await expect(status(page)).toHaveText("Zapisane");
  await expect(selected(page)).toHaveCount(3);
  await page.reload();
  await expect(page.getByRole("tab", { name: "Wszyscy", selected: true })).toBeVisible();
});

test("a second device typing the same name gets To ty, Ola? and takes the row over", async ({ browser }, testInfo) => {
  const { link } = await createPoll(browser);
  const first = await openAsNewDevice(browser, link);

  await nameField(first).fill("Ola");
  await cellAt(first, 0, 0).click();
  await expect(status(first)).toHaveText("Zapisane");

  const second = await openAsNewDevice(browser, link);

  await nameField(second).fill("Ola");
  await cellAt(second, 1, 1).click();
  await expect(second.getByRole("region", { name: "To Ty, Ola?" })).toContainText("Na innym telefonie, 1 godzina");
  await expect(status(second)).toHaveText("Nie zapisano");
  await saveScreenshot(second, testInfo, "answer-to-ty");
  await second.getByRole("button", { name: "Tak, to ja" }).click();

  await expect(status(second)).toHaveText("Zapisane");
  await expect(selected(second)).toHaveCount(2);
  await second.reload();
  await expect(second.getByRole("tab", { name: "Wszyscy", selected: true })).toBeVisible();
  await first.reload();
  await expect(first.getByRole("tab", { name: "Moje", selected: true })).toBeVisible();
});

test("a device that answered as Bartek hears its hours join Ola's before Tak, to ja", async ({ browser }, testInfo) => {
  const { link } = await createPoll(browser);
  const ola = await openAsNewDevice(browser, link);

  await nameField(ola).fill("Ola");
  await cellAt(ola, 0, 0).click();
  await expect(status(ola)).toHaveText("Zapisane");
  const bartek = await openAsNewDevice(browser, link);

  await nameField(bartek).fill("Bartek");
  await cellAt(bartek, 2, 2).click();
  await expect(status(bartek)).toHaveText("Zapisane");

  await nameField(bartek).fill("Ola");
  const clash = bartek.getByRole("region", { name: "To Ty, Ola?" });

  await expect(clash).toContainText("Twoje godziny jako Bartek dołączą do tych.");
  await saveScreenshot(bartek, testInfo, "answer-to-ty-merge");
  await clash.getByRole("button", { name: "Tak, to ja" }).click();
  await expect(status(bartek)).toHaveText("Zapisane");

  await bartek.reload();
  await bartek.getByRole("tab", { name: "Moje" }).click();
  await expect(nameField(bartek)).toHaveValue("Ola");
  await expect(selected(bartek)).toHaveCount(2);
  await bartek.getByRole("tab", { name: "Wszyscy" }).click();
  await expect(bartek.getByRole("grid", { name: "Kto może" }).getByRole("button", { name: /, 1 z 1 może$/ })).toHaveCount(2);
});

test("server data never overwrites my Moje grid while another device saves", async ({ browser }) => {
  const { link } = await createPoll(browser);
  const mine = await openAsNewDevice(browser, link);

  await nameField(mine).fill("Michał");
  await cellAt(mine, 0, 0).click();
  await expect(status(mine)).toHaveText("Zapisane");
  await cellAt(mine, 5, 2).click();

  const other = await openAsNewDevice(browser, link);

  await nameField(other).fill("Ola");
  await cellAt(other, 2, 1).click();
  await expect(status(other)).toHaveText("Zapisane");
  await mine.getByRole("tab", { name: "Wszyscy" }).click();
  await expect(mine.getByText(/^2 osoby/).filter({ visible: true })).toBeVisible({ timeout: 10_000 });
  await mine.getByRole("tab", { name: "Moje" }).click();

  await expect(status(mine)).toHaveText("Zapisane");
  await expect(selected(mine)).toHaveCount(2);
  await expect(cellAt(mine, 2, 1).locator("..")).toHaveAttribute("aria-selected", "false");
});

test("the organiser answers on Moje under the name from create, with no name field", async ({ browser }, testInfo) => {
  const { organiser } = await createPoll(browser);

  await expect(organiser.getByRole("tab", { name: "Moje", selected: true })).toBeVisible();
  await expect(organiser.getByText("Pytasz jako Kuba")).toBeVisible();
  await expect(organiser.getByText("Zaznacz też swoje godziny.")).toBeVisible();

  await expect(organiser.getByText(/^Kliknij godziny/)).toHaveText(
    testInfo.project.use.hasTouch
      ? "Kliknij godziny, kiedy możesz. Przytrzymaj, żeby przeciągnąć."
      : "Kliknij godziny, kiedy możesz. Możesz przeciągnąć.",
    { useInnerText: true },
  );

  await expect(organiser.getByRole("textbox", { name: "Twoje imię" })).toHaveCount(0);

  await tap(cellAt(organiser, 0, 0), testInfo);

  await expect(status(organiser)).toHaveText("Zapisane");
  await expect(cantButton(organiser)).toBeVisible();
  await expect(invitation(organiser)).toHaveCount(0);
});

test("a participant is invited to make their own poll under the saved answer, again on return", async ({ browser }, testInfo) => {
  const { link } = await createPoll(browser);
  const page = await openAsNewDevice(browser, link);

  await nameField(page).fill("Zuza");
  await expect(invitation(page)).toHaveCount(0);
  await tap(cellAt(page, 0, 0), testInfo);

  await expect(status(page)).toHaveText("Zapisane");
  await expect(invitation(page)).toBeVisible();
  expect((await invitation(page).boundingBox())!.y).toBeGreaterThan((await cantButton(page).boundingBox())!.y);
  await saveScreenshot(page, testInfo, "answer-invitation");

  await page.reload();
  await page.getByRole("tab", { name: "Moje" }).click();

  await expect(invitation(page)).toBeVisible();

  await invitation(page).click();

  await expect(page).toHaveURL(/\/$/);
});

test("a returning device finds its last name prefilled and the field left alone", async ({ browser }) => {
  const { link } = await createPoll(browser);
  const context = await browser.newContext(test.info().project.use);

  await context.addInitScript(() => localStorage.setItem("last-name", "Ola"));
  const page = await context.newPage();

  await page.goto(link);

  await expect(nameField(page)).toHaveValue("Ola");
  await expect(nameField(page)).not.toBeFocused();
});

test("save states: Zapisuję, Nie zapisano with Spróbuj ponownie, and nie może", async ({ browser }, testInfo) => {
  const { link } = await createPoll(browser);
  const page = await openAsNewDevice(browser, link);
  let release = () => {};
  let onHeld = () => {};
  const held = new Promise<void>((resolve) => (onHeld = resolve));

  await page.route(link, async (route) => {
    if (route.request().method() !== "POST") return route.continue();

    onHeld();
    await new Promise<void>((resolve) => (release = resolve));
    await route.continue();
  });

  await nameField(page).fill("Zuza");
  await cellAt(page, 0, 0).click();
  await held;
  await expect(status(page)).toHaveText("Zapisuję");
  await saveScreenshot(page, testInfo, "answer-zapisuje");
  release();
  await expect(status(page)).toHaveText("Zapisane");

  await page.unroute(link);
  await page.route(link, (route) => (route.request().method() === "POST" ? route.abort() : route.continue()));
  await cellAt(page, 1, 0).click();
  await expect(status(page)).toHaveText("Nie zapisano");
  await saveScreenshot(page, testInfo, "answer-nie-zapisano");
  await page.unroute(link);
  await page.getByRole("button", { name: "Spróbuj ponownie" }).click();
  await expect(status(page)).toHaveText("Zapisane");

  await cantButton(page).click();
  await expect(page.getByRole("button", { name: "Nie mogę w żadnym terminie", pressed: true })).toBeVisible();
  await expect(selected(page)).toHaveCount(0);
  await expect(status(page)).toHaveText("Zapisane");
  await saveScreenshot(page, testInfo, "answer-nie-moze");

  await page.getByRole("button", { name: "Cofnij" }).click();
  await expect(selected(page)).toHaveCount(2);
  await expect(page.getByRole("button", { name: "Nie mogę w żadnym terminie", pressed: false })).toBeVisible();
  await expect(status(page)).toHaveText("Zapisane");
  await page.reload();
  await page.getByRole("tab", { name: "Moje" }).click();
  await expect(selected(page)).toHaveCount(2);

  await cantButton(page).click();
  await expect(selected(page)).toHaveCount(0);
  await expect(status(page)).toHaveText("Zapisane");
  await page.reload();
  await page.getByRole("tab", { name: "Moje" }).click();
  await expect(page.getByRole("button", { name: "Nie mogę w żadnym terminie", pressed: true })).toBeVisible();
  await cantButton(page).click();
  await expect(page.getByRole("button", { name: "Nie mogę w żadnym terminie", pressed: false })).toBeVisible();
  await cellAt(page, 2, 0).click();
  await expect(page.getByRole("button", { name: "Nie mogę w żadnym terminie", pressed: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Cofnij" })).toHaveCount(0);
  await expect(status(page)).toHaveText("Zapisane");
  await page.reload();
  await page.getByRole("tab", { name: "Moje" }).click();
  await expect(selected(page)).toHaveCount(1);
});

test("failed saves reach the server log, one report each and at most five per page load", async ({ browser }) => {
  const { link } = await createPoll(browser);
  const page = await openAsNewDevice(browser, link);
  const reports: Request[] = [];
  let failedSaves = 0;

  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/api/failed-saves") reports.push(request);
  });

  await page.route(link, (route) => {
    if (route.request().method() !== "POST") return route.continue();

    failedSaves++;

    return route.abort();
  });

  await nameField(page).fill("Zuza");
  await cellAt(page, 0, 0).click();
  await expect(status(page)).toHaveText("Nie zapisano");
  await expect.poll(() => reports.length).toBe(1);

  for (let attempt = 2; attempt <= 6; attempt++) {
    await page.getByRole("button", { name: "Spróbuj ponownie" }).click();
    await expect.poll(() => failedSaves).toBe(attempt);
    await expect(page.getByRole("button", { name: "Spróbuj ponownie" })).toBeVisible();
    await expect.poll(() => reports.length).toBe(Math.min(attempt, 5));
  }

  await page.unroute(link);
  await page.getByRole("button", { name: "Spróbuj ponownie" }).click();
  await expect(status(page)).toHaveText("Zapisane");

  expect(reports).toHaveLength(5);

  for (const report of reports) {
    expect(report.postDataJSON()).toEqual({ action: "saveAnswer", errorName: "TypeError" });
    expect((await report.response())?.status()).toBe(204);
  }
});

test("a newcomer to a poll with 30 people reads that it is full and to write on the group", async ({ browser }, testInfo) => {
  const pollId = seedPoll({ dates: ["2030-10-26", "2030-10-27"], firstHour: 17, hourCount: 4 });

  for (let index = 1; index <= 30; index++) seedAnswer(pollId, `Osoba ${index}`, Date.now(), [["2030-10-26", 18]]);

  const page = await openAsNewDevice(browser, `/e/${pollId}`);

  await nameField(page).fill("Zosia");
  await tap(cellAt(page, 0, 0), testInfo);

  await expect(
    page.getByRole("alert").filter({ hasText: "W tej ankiecie jest już 30 osób, więcej się nie zmieści. Napisz na grupie, kiedy możesz." }),
  ).toBeVisible();

  await saveScreenshot(page, testInfo, "answer-full");
});
