import type { Browser, Locator, Page, TestInfo } from "@playwright/test";
import { expect, test } from "./fixtures";
import { centresOf, mouseDrag, touchDrag } from "./pointer";
import { saveScreenshot } from "./screenshot";

declare global {
  interface Window {
    sentTexts?: string[];
  }
}

const mondayBeforeTheWeekend = new Date("2030-10-21T10:00:00+02:00");
const title = "Planszówki u Michała";

async function openAsNewDevice(browser: Browser, link: string, clock?: Date) {
  const context = await browser.newContext(test.info().project.use);
  const page = await context.newPage();

  if (clock) await page.clock.setFixedTime(clock);

  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async ({ text }: ShareData) => {
        window.sentTexts = [...(window.sentTexts ?? []), text!];
      },
    });
  });

  await page.goto(link);

  return page;
}

const isPhone = (testInfo: TestInfo) => testInfo.project.name.startsWith("phone");
const lastSent = (page: Page) => page.evaluate(() => window.sentTexts?.at(-1));
const refreshNow = (page: Page) => page.evaluate(() => window.dispatchEvent(new Event("focus")));

const dates = ["pt 25", "sb 26", "nd 27"];
const hours = [17, 18, 19, 20, 21, 22];

function cellAt(page: Page, date: string, hour: number) {
  return page
    .getByRole("grid", { name: "Kiedy możesz?" })
    .getByRole("row")
    .nth(hours.indexOf(hour) + 1)
    .getByRole("button")
    .nth(dates.indexOf(date) + 1);
}

async function tap(cell: Locator, testInfo: TestInfo) {
  if (testInfo.project.use.hasTouch) await cell.tap();
  else await cell.click();
}

async function answerWithTaps(browser: Browser, link: string, name: string, cells: [string, number][], testInfo: TestInfo) {
  const page = await openAsNewDevice(browser, link);

  await page.getByRole("textbox", { name: "Twoje imię" }).fill(name);
  for (const [date, hour] of cells) await tap(cellAt(page, date, hour), testInfo);
  await expect(page.getByRole("status")).toHaveText("Zapisane");

  return page;
}

test("the organiser creates a weekend poll, three friends answer, the organiser reminds and sets the time, and a friend adds it to the calendar", async ({
  browser,
}, testInfo) => {
  const organiser = await openAsNewDevice(browser, "/", mondayBeforeTheWeekend);

  await organiser.getByRole("textbox", { name: "Co robimy?" }).fill(title);
  await organiser.getByRole("button", { name: "Ten weekend" }).click();

  await expect(organiser.getByRole("group", { name: "Dni" }).getByRole("button", { pressed: true })).toHaveCount(3);

  await expect(
    organiser.getByRole("group", { name: "O której?" }).getByText("17:00 → 23:00 · 6 godzin").filter({ visible: true }),
  ).toBeVisible();

  await organiser.getByRole("textbox", { name: "Twoje imię" }).fill("Kuba");
  await organiser.getByRole("button", { name: "Utwórz i wyślij na grupę" }).click();
  await expect(organiser).toHaveURL(/\/e\/[A-Za-z0-9_-]{10}$/);
  const link = organiser.url();

  await organiser.getByRole("region", { name: "Ankieta gotowa" }).getByRole("button", { name: "Wyślij na grupę" }).click();
  await expect.poll(() => lastSent(organiser)).toBe(`Kiedy możecie? ${title} ${link}`);

  const ola = await openAsNewDevice(browser, link);
  const dragWith = testInfo.project.name === "phone-chromium" ? touchDrag : mouseDrag;

  await ola.getByRole("textbox", { name: "Twoje imię" }).fill("Ola");
  await dragWith(ola, ...(await centresOf(cellAt(ola, "sb 26", 19), cellAt(ola, "nd 27", 21))));
  await expect(ola.getByRole("status")).toHaveText("Zapisane");
  await expect(ola.getByRole("gridcell", { selected: true })).toHaveCount(6);

  await answerWithTaps(
    browser,
    link,
    "Bartek",
    [
      ["pt 25", 18],
      ["sb 26", 19],
      ["sb 26", 20],
      ["nd 27", 19],
      ["nd 27", 20],
    ],
    testInfo,
  );

  const zuza = await answerWithTaps(
    browser,
    link,
    "Zuza",
    [
      ["sb 26", 21],
      ["nd 27", 19],
      ["nd 27", 20],
    ],
    testInfo,
  );

  await zuza.getByRole("tab", { name: "Wszyscy" }).click();
  await expect(zuza.getByRole("region", { name: "Najlepiej teraz" })).toHaveText("Najlepiej terazNiedziela 27.10, 19–21");

  const handCount: Record<string, number[]> = {
    "pt 25": [0, 1, 0, 0, 0, 0],
    "sb 26": [0, 0, 2, 2, 2, 0],
    "nd 27": [0, 0, 3, 3, 1, 0],
  };

  for (const [date, counts] of Object.entries(handCount)) {
    for (const [index, count] of counts.entries()) {
      await expect(zuza.getByRole("button", { name: `${date}, ${hours[index]}:00, ${count} z 3 może` })).toHaveText(
        count ? String(count) : "",
      );
    }
  }

  const whoCan: [string, string, string[], string[]][] = [
    ["sb 26, 20:00", "Sobota 26.10, 20:00", ["BBartek", "OOla"], ["ZZuza, to Ty, nie może"]],
    ["sb 26, 21:00", "Sobota 26.10, 21:00", ["ZZuza, to Ty", "OOla"], ["BBartek, nie może"]],
  ];

  for (const [cell, heading, can, cannot] of whoCan) {
    await zuza.getByRole("button", { name: new RegExp(`^${cell}`) }).click();
    const details = zuza.getByRole(isPhone(testInfo) ? "dialog" : "region", { name: heading });

    await expect(details.getByRole("list", { name: "Może", exact: true }).getByRole("listitem")).toHaveText(can);
    await expect(details.getByRole("list", { name: "Nie może" }).getByRole("listitem")).toHaveText(cannot);
    await saveScreenshot(zuza, testInfo, `journey-who-can-${cell.slice(7, 9)}`);
    if (isPhone(testInfo)) await zuza.keyboard.press("Escape");
    else await details.getByRole("button", { name: "Zamknij" }).click();

    await expect(details).toBeHidden();
  }

  if (isPhone(testInfo)) await zuza.getByRole("button", { name: "3 osoby" }).click();

  await expect(
    zuza.getByRole("list", { name: isPhone(testInfo) ? "Zaznaczyli godziny" : "Odpowiedzieli" }).getByRole("listitem"),
  ).toHaveText(["ZZuza, to Ty", "BBartek", "OOla"]);

  await saveScreenshot(zuza, testInfo, "journey-results");

  await refreshNow(organiser);
  await organiser.getByRole("tab", { name: "Wszyscy" }).click();
  await expect(organiser.getByRole("region", { name: "Najlepiej teraz" })).toHaveText("Najlepiej terazNiedziela 27.10, 19–21");
  await organiser.getByRole("button", { name: "Przypomnij" }).click();
  await expect.poll(() => lastSent(organiser)).toBe(`Już są: Ola, Bartek i Zuza. Reszta, kiedy możecie? ${title} ${link}`);

  await organiser.getByRole("region", { name: "Twoja ankieta" }).getByRole("button", { name: "Ustal termin" }).click();
  await expect(organiser.getByRole("region", { name: "Termin" })).toContainText("19:00–21:00");
  await saveScreenshot(organiser, testInfo, "journey-set-organiser");

  await ola.reload();
  const setTime = ola.getByRole("region", { name: "Termin" });

  await expect(setTime).toContainText("Niedziela");
  await expect(setTime).toContainText("27 października");
  await expect(setTime).toContainText("19:00–21:00");
  await expect(ola.getByRole("grid", { name: "Kiedy możesz?" })).toHaveCount(0);

  await ola.getByRole("button", { name: "Dodaj do kalendarza" }).click();
  const calendarMenu = ola.getByRole("dialog", { name: "Dodaj do kalendarza" });

  await expect(calendarMenu).toBeVisible();
  await saveScreenshot(ola, testInfo, "journey-calendar-menu");
  const google = new URL((await calendarMenu.getByRole("link", { name: "Kalendarz Google" }).getAttribute("href"))!);

  expect(google.searchParams.get("dates")).toBe("20301027T180000Z/20301027T200000Z");
  const outlook = new URL((await calendarMenu.getByRole("link", { name: "Outlook" }).getAttribute("href"))!);

  expect(outlook.searchParams.get("startdt")).toBe("2030-10-27T18:00:00Z");
  expect(outlook.searchParams.get("enddt")).toBe("2030-10-27T20:00:00Z");
  const ics = await ola.request.get((await calendarMenu.getByRole("link", { name: "Kalendarz Apple" }).getAttribute("href"))!);

  expect(ics.headers()["content-type"]).toBe("text/calendar; charset=utf-8");
  expect((await ics.text()).split("\r\n")).toEqual(expect.arrayContaining(["DTSTART:20301027T180000Z", "DTEND:20301027T200000Z"]));
});
