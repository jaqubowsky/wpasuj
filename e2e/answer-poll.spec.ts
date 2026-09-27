import { expect, test, type Browser, type Locator, type Page, type TestInfo } from "@playwright/test";
import { centreOf, mouseDrag, touchDrag } from "./pointer";
import { saveScreenshot } from "./screenshot";

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

const nameField = (page: Page) => page.getByRole("textbox", { name: "Jak masz na imię?" });
const status = (page: Page) => page.getByRole("status");
const selected = (page: Page) => page.getByRole("gridcell", { selected: true });

function cellAt(page: Page, hourIndex: number, dateIndex: number) {
  return page.getByRole("grid", { name: "Kiedy możesz?" }).getByRole("row").nth(hourIndex + 1).getByRole("button").nth(dateIndex + 1);
}

async function drag(page: Page, testInfo: TestInfo, from: Locator, to: Locator, beforeRelease?: () => Promise<void>) {
  const dragWith = testInfo.project.name === "phone-chromium" ? touchDrag : mouseDrag;
  await dragWith(page, await centreOf(from), await centreOf(to), beforeRelease);
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
  await drag(page, testInfo, cellAt(page, 1, 0), cellAt(page, 3, 2), () => saveScreenshot(page, testInfo, "answer-painting"));

  await expect(status(page)).toHaveText("Zapisane");
  await expect(selected(page)).toHaveCount(9);
  await expect(page.getByText("Gotowe. Zmieniasz zdanie? Po prostu kliknij.")).toBeVisible();
  await saveScreenshot(page, testInfo, "answer-zapisane");

  await page.reload();
  await expect(page.getByRole("tab", { name: "Wszyscy", selected: true })).toBeVisible();
  await page.getByRole("tab", { name: "Moje" }).click();
  await expect(nameField(page)).toHaveValue("Zuza");
  await expect(selected(page)).toHaveCount(9);
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
  await expect(second.getByText("To ty, Ola?")).toBeVisible();
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
  await mine.evaluate(() => {
    window.dispatchEvent(new Event("focus"));
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await mine.getByRole("tab", { name: "Wszyscy" }).click();
  await mine.getByRole("tab", { name: "Moje" }).click();

  await expect(status(mine)).toHaveText("Zapisane");
  await expect(selected(mine)).toHaveCount(2);
  await expect(cellAt(mine, 2, 1)).toHaveAttribute("aria-pressed", "false");
});

test("the organiser answers on Moje with the name from create prefilled", async ({ browser }) => {
  const { organiser } = await createPoll(browser);

  await expect(organiser.getByRole("tab", { name: "Moje", selected: true })).toBeVisible();
  await expect(nameField(organiser)).toHaveValue("Kuba");
  await expect(nameField(organiser)).not.toBeFocused();
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

  await page.getByRole("button", { name: "Nie mogę w żadnym terminie" }).click();
  await expect(page.getByText("Nie możesz w żadnym terminie. Zmieniasz zdanie? Po prostu kliknij.")).toBeVisible();
  await expect(status(page)).toHaveText("Zapisane");
  await expect(selected(page)).toHaveCount(0);
  await saveScreenshot(page, testInfo, "answer-nie-moze");
  await page.reload();
  await page.getByRole("tab", { name: "Moje" }).click();
  await expect(selected(page)).toHaveCount(0);
});
