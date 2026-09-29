import type { Browser, Locator, Page, TestInfo } from "@playwright/test";
import { expect, test } from "./fixtures";
import { stubClipboardWithoutShareSheet } from "./clipboard";
import { saveScreenshot, settleAnimations } from "./screenshot";
import { seedAnswer, seedPoll } from "./seed";

const friday = "2031-10-17";
const saturday = "2031-10-18";
const sunday = "2031-10-19";
const organiserToken = "organiser-token-for-the-v3-poll-0123456789";

type Seeded = { pollId: string; zuza: string; kuba: string };

function seedBoardPoll(): Seeded {
  const pollId = seedPoll({ dates: [friday, saturday, sunday], firstHour: 18, hourCount: 4, organiserToken });
  const at = (minutes: number) => Date.now() - minutes * 60_000;

  seedAnswer(pollId, "Bartek", at(50), []);

  seedAnswer(pollId, "Michał", at(40), [
    [friday, 18],
    [friday, 19],
    [friday, 20],
    [saturday, 19],
    [saturday, 20],
    [saturday, 21],
    [sunday, 20],
  ]);

  const kuba = seedAnswer(pollId, "Kuba", at(30), [
    [friday, 21],
    [saturday, 18],
    [saturday, 19],
    [saturday, 20],
    [sunday, 18],
    [sunday, 19],
    [sunday, 20],
  ]);

  seedAnswer(pollId, "Ola", at(20), [
    [friday, 19],
    [friday, 20],
    [saturday, 18],
    [saturday, 19],
    [saturday, 20],
    [saturday, 21],
    [sunday, 19],
  ]);

  const zuza = seedAnswer(pollId, "Zuza", at(10), [
    [friday, 19],
    [friday, 20],
    [saturday, 18],
    [saturday, 19],
    [saturday, 20],
  ]);

  return { pollId, zuza, kuba };
}

async function openAs(browser: Browser, pollId: string, cookies: Record<string, string> = {}) {
  const context = await browser.newContext(test.info().project.use);

  await context.addCookies(Object.entries(cookies).map(([name, value]) => ({ name, value, url: "http://localhost:3000" })));
  const page = await context.newPage();

  await stubClipboardWithoutShareSheet(page);
  await page.goto(`/e/${pollId}`);

  return page;
}

const asZuza = (browser: Browser, { pollId, zuza }: Seeded) => openAs(browser, pollId, { [pollId]: zuza });

const asOrganiser = (browser: Browser, { pollId, kuba }: Seeded) =>
  openAs(browser, pollId, { [pollId]: kuba, [`${pollId}-org`]: organiserToken });

const isPhone = (testInfo: TestInfo) => testInfo.project.name.startsWith("phone");
const tab = (page: Page, name: "Moje" | "Wszyscy") => page.getByRole("tab", { name });
const best = (page: Page) => page.getByRole("region", { name: "Najlepiej teraz" });
const more = (page: Page) => page.getByRole("button", { name: "Więcej" });
const moreDialog = (page: Page) => page.getByRole("dialog", { name: "Więcej" });
const animationsDone = (page: Page) => expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0);
const firstCell = (page: Page) => page.getByRole("grid", { name: "Kiedy możesz?" }).getByRole("row").nth(1).getByRole("button").nth(1);
const cant = (page: Page) => page.getByRole("button", { name: "Nie mogę w żadnym terminie" });

async function tapOn(target: Locator, testInfo: TestInfo) {
  if (testInfo.project.use.hasTouch) await target.tap();
  else await target.click();
}

async function boxes(locators: Locator[]) {
  return Promise.all(
    locators.map((locator) =>
      locator.evaluate((element) => {
        const { x, y, width, height } = element.getBoundingClientRect();

        return { x: x + scrollX, y: y + scrollY, width, height };
      }),
    ),
  );
}

test("Answer: a participant's Moje with the best time, the name and the Nie mogę button", async ({ browser }, testInfo) => {
  const page = await asZuza(browser, seedBoardPoll());

  await tab(page, "Moje").click();

  await expect(best(page)).toHaveText("Najlepiej terazSobota 18.10, 19–21");
  await expect(page.getByRole("textbox", { name: "Twoje imię" })).toHaveValue("Zuza");
  await expect(page.getByText("Kliknij godziny, kiedy możesz. Możesz przeciągnąć.")).toBeVisible();
  await expect(page.getByRole("grid", { name: "Kiedy możesz?" }).getByRole("gridcell", { selected: true })).toHaveCount(5);
  await saveScreenshot(page, testInfo, "v3-answer");
});

test("CantMake: Nie mogę and Cofnij move nothing above the grid", async ({ browser }, testInfo) => {
  const page = await asZuza(browser, seedBoardPoll());

  await tab(page, "Moje").click();
  const grid = page.getByRole("grid", { name: "Kiedy możesz?" });

  await animationsDone(page);

  const above = [
    page.getByRole("banner"),
    page.getByRole("heading", { level: 1 }),
    page.getByRole("textbox", { name: "Twoje imię" }),
    page.getByRole("tablist"),
    grid.getByRole("columnheader").first(),
  ];

  const before = await boxes(above);

  await cant(page).click();

  await expect(page.getByRole("button", { name: "Nie mogę w żadnym terminie", pressed: true })).toBeVisible();
  await expect(grid.getByRole("gridcell", { selected: true })).toHaveCount(0);
  await expect(page.getByRole("status").filter({ hasText: "Zapisane" })).toBeVisible();
  expect(await boxes(above)).toEqual(before);
  await saveScreenshot(page, testInfo, "v3-cant-make");

  await page.getByRole("button", { name: "Cofnij" }).click();

  await expect(grid.getByRole("gridcell", { selected: true })).toHaveCount(5);
  expect(await boxes(above)).toEqual(before);
});

test("NameClash: a second device typing a name that answered gets To Ty?", async ({ browser }, testInfo) => {
  const seeded = seedBoardPoll();
  const page = await openAs(browser, seeded.pollId);

  await tab(page, "Moje").click();

  await page.getByRole("textbox", { name: "Twoje imię" }).fill("Ola");
  await tapOn(firstCell(page), testInfo);

  const clash = page.getByRole("region", { name: "To Ty, Ola?" });

  await expect(clash).toContainText("Na innym telefonie, 7 godzin");
  await expect(clash.getByRole("button", { name: "Tak, to ja" })).toBeVisible();
  await expect(clash.getByRole("button", { name: "To nie ja" })).toBeVisible();
  await saveScreenshot(page, testInfo, "v3-name-clash");
});

test("OrganiserName: the organiser's name cannot be taken", async ({ browser }, testInfo) => {
  const seeded = seedBoardPoll();
  const page = await openAs(browser, seeded.pollId);

  await tab(page, "Moje").click();

  await page.getByRole("textbox", { name: "Twoje imię" }).fill("kuba");
  await tapOn(firstCell(page), testInfo);

  await expect(page.getByText("Tak ma na imię organizator. Wpisz swoje.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Tak, to ja" })).toHaveCount(0);
  await saveScreenshot(page, testInfo, "v3-organiser-name");
});

test("the organiser's avatar in the header takes the tint of the organiser's row", async ({ browser }, testInfo) => {
  test.skip(isPhone(testInfo), "the people card sits beside the grid on a desktop");
  const page = await asZuza(browser, seedBoardPoll());

  const header = page.getByRole("main").getByRole("img", { name: "Kuba" }).first();
  const row = page.getByRole("list", { name: "Odpowiedzieli" }).getByRole("img", { name: "Kuba" });

  await expect(header).toHaveAttribute("data-tint", (await row.getAttribute("data-tint"))!);
});

test("CellSheet: tapping an hour shows who can and who cannot", async ({ browser }, testInfo) => {
  const page = await asZuza(browser, seedBoardPoll());

  await tab(page, "Wszyscy").click();
  await expect(page.getByText("Kliknij godzinę, żeby zobaczyć, kto może.")).toBeVisible();

  await page.getByRole("button", { name: "sb 18, 19:00, 4 z 5 może" }).click();

  const details = page.getByRole(isPhone(testInfo) ? "dialog" : "region", { name: "Sobota 18.10, 19:00" });

  await expect(details.getByRole("list", { name: "Może", exact: true }).getByRole("listitem")).toHaveText([
    "ZZuza, to Ty",
    "OOla",
    "KKuba, organizator",
    "MMichał",
  ]);

  await expect(details.getByRole("list", { name: "Nie może", exact: true }).getByRole("listitem")).toHaveText(["BBartek, nie może"]);
  await saveScreenshot(page, testInfo, "v3-cell-sheet");
});

test("Respondents: the counter opens who answered on a phone; the desktop lists them beside the grid", async ({ browser }, testInfo) => {
  const page = await asZuza(browser, seedBoardPoll());

  if (isPhone(testInfo)) {
    await page.getByRole("button", { name: "5 osób" }).click();
    const sheet = page.getByRole("dialog", { name: "Odpowiedzieli" });

    await expect(sheet.getByRole("list", { name: "Zaznaczyli godziny" }).getByRole("listitem")).toHaveCount(4);
    await expect(sheet.getByRole("list", { name: "Nie może w żadnym" }).getByRole("listitem")).toHaveText(["BBartek, nie może"]);
  } else {
    await expect(page.getByText("5 osób już odpowiedziało")).toBeVisible();
    await expect(page.getByRole("list", { name: "Odpowiedzieli" }).getByRole("listitem")).toHaveCount(5);
  }

  await saveScreenshot(page, testInfo, "v3-respondents");
});

test("Organiser: Twoja ankieta with Ustal termin, Przypomnij and ⋯", async ({ browser }, testInfo) => {
  const page = await asOrganiser(browser, seedBoardPoll());

  await tab(page, "Wszyscy").click();

  const card = page.getByRole("region", { name: "Twoja ankieta" });

  await expect(card.getByRole("button", { name: "Ustal termin" })).toBeVisible();
  await expect(card.getByRole("button", { name: "Przypomnij" })).toBeVisible();
  await expect(page.getByText("Pytasz jako Kuba")).toBeVisible();
  await saveScreenshot(page, testInfo, "v3-organiser");
});

test("⋯ opens a sheet on a phone and a menu on a desktop; Escape and the scrim close it and focus returns", async ({
  browser,
}, testInfo) => {
  const page = await asOrganiser(browser, seedBoardPoll());

  await tab(page, "Wszyscy").click();

  await more(page).click();
  await expect(moreDialog(page).getByRole("button", { name: "Usuń ankietę" })).toBeVisible();
  await settleAnimations(page);
  const sheet = (await moreDialog(page).boundingBox())!;
  const viewport = page.viewportSize()!;

  if (isPhone(testInfo)) {
    expect(sheet.x).toBe(0);
    expect(sheet.width).toBe(viewport.width);
    expect(Math.round(sheet.y + sheet.height)).toBe(viewport.height);
  } else {
    const trigger = (await more(page).boundingBox())!;

    expect(sheet.y).toBeGreaterThan(trigger.y + trigger.height);
    expect(sheet.x + sheet.width).toBeCloseTo(trigger.x + trigger.width, 0);
    expect(sheet.width).toBe(320);
  }

  await saveScreenshot(page, testInfo, "v3-organiser-sheet");
  await saveScreenshot(page, testInfo, "v3-desktop-wszyscy");

  await page.keyboard.press("Escape");
  await expect(moreDialog(page)).toHaveCount(0);
  await expect(more(page)).toBeFocused();

  await more(page).click();
  await page.mouse.click(8, 8);
  await expect(moreDialog(page)).toHaveCount(0);
  await expect(more(page)).toBeFocused();
});

test("DeleteConfirm: Usuń ankietę asks first", async ({ browser }, testInfo) => {
  const page = await asOrganiser(browser, seedBoardPoll());

  await more(page).click();

  await moreDialog(page).getByRole("button", { name: "Usuń ankietę" }).click();

  const confirm = page.getByRole("dialog", { name: "Usunąć ankietę?" });

  await expect(confirm).toContainText("Znikną też odpowiedzi 5 osób. Tego nie da się cofnąć.");
  await saveScreenshot(page, testInfo, "v3-delete-confirm");
  await confirm.getByRole("button", { name: "Tak, usuń" }).click();

  await expect(page.getByRole("heading", { name: "Tej ankiety już nie ma" })).toBeVisible();
  await saveScreenshot(page, testInfo, "v3-poll-gone");
});

test("DesktopMoje: on a desktop, switching tabs moves no part of the header, title, tab switch or side panel", async ({
  browser,
}, testInfo) => {
  const page = await asOrganiser(browser, seedBoardPoll());

  await tab(page, "Moje").click();
  if (isPhone(testInfo)) return saveScreenshot(page, testInfo, "v3-desktop-moje");

  await animationsDone(page);

  const fixed = [
    page.getByRole("banner"),
    page.getByRole("heading", { level: 1 }),
    page.getByRole("tablist"),
    best(page),
    page.getByRole("region", { name: "Twoja ankieta" }),
    page.getByRole("list", { name: "Odpowiedzieli" }),
  ];

  const onMoje = await boxes(fixed);

  await saveScreenshot(page, testInfo, "v3-desktop-moje");

  await tab(page, "Wszyscy").click();
  await expect(tab(page, "Wszyscy")).toHaveAttribute("aria-selected", "true");
  await animationsDone(page);

  expect(await boxes(fixed)).toEqual(onMoje);
  const [tabs, panel] = await boxes([page.getByRole("tablist"), best(page)]);

  expect(panel!.y).toBe(tabs!.y);
  expect(panel!.x).toBeGreaterThan(tabs!.x + tabs!.width);
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the ⋯ sheet opens with no animation", async ({ browser }) => {
    const page = await asOrganiser(browser, seedBoardPoll());

    await more(page).click();

    await expect(moreDialog(page)).toBeVisible();
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  });
});
