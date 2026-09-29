import type { Browser, Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { stubClipboardWithoutShareSheet } from "./clipboard";
import { saveScreenshot, settleAnimations } from "./screenshot";
import { seedAnswer, seedPoll } from "./seed";

const saturday = "2030-10-26";
const sunday = "2030-10-27";
const organiserToken = "organiser-token-for-the-e2e-poll-0123456789";

function seedAnsweredPoll() {
  const pollId = seedPoll({ dates: [saturday, sunday], firstHour: 17, hourCount: 4, organiserToken });

  seedAnswer(pollId, "Ola", Date.now(), [
    [saturday, 17],
    [sunday, 18],
    [sunday, 19],
  ]);

  seedAnswer(pollId, "Bartek", Date.now(), [
    [saturday, 18],
    [sunday, 18],
    [sunday, 19],
  ]);

  seedAnswer(pollId, "Michał", Date.now(), [
    [saturday, 17],
    [saturday, 18],
    [sunday, 18],
    [sunday, 19],
  ]);

  return pollId;
}

async function openAsNewDevice(browser: Browser, path: string, asOrganiserOf?: string, answeredWith?: { pollId: string; token: string }) {
  const context = await browser.newContext(test.info().project.use);

  if (asOrganiserOf) {
    await context.addCookies([{ name: `${asOrganiserOf}-org`, value: organiserToken, url: "http://localhost:3000" }]);
  }

  if (answeredWith) {
    await context.addCookies([{ name: answeredWith.pollId, value: answeredWith.token, url: "http://localhost:3000" }]);
  }

  const page = await context.newPage();

  await stubClipboardWithoutShareSheet(page);
  await page.goto(path);

  return page;
}

async function openResults(page: Page) {
  await page.getByRole("tab", { name: "Wszyscy" }).click();
}

const copied = (page: Page) => page.evaluate(() => window.copied);

test("the organiser reminds and sets the time", async ({ browser }, testInfo) => {
  const pollId = seedAnsweredPoll();
  const organiser = await openAsNewDevice(browser, `/e/${pollId}`, pollId);

  await openResults(organiser);
  await expect(organiser.getByRole("button", { name: "Przypomnij" })).toBeVisible();
  await saveScreenshot(organiser, testInfo, "organiser-row");

  await organiser.getByRole("button", { name: "Przypomnij" }).click();

  await expect
    .poll(() => copied(organiser))
    .toBe(`Już są: Ola, Bartek i Michał. Reszta, kiedy możecie? Planszówki u Michała http://localhost:3000/e/${pollId}`);

  await organiser.getByRole("button", { name: "Więcej" }).click();
  await expect(organiser.getByRole("dialog", { name: "Więcej" })).toBeVisible();
  await saveScreenshot(organiser, testInfo, "organiser-menu");
  await organiser.getByRole("button", { name: "Usuń ankietę" }).click();
  await saveScreenshot(organiser, testInfo, "organiser-delete-confirm");
  await organiser.getByRole("button", { name: "Nie, zostaw" }).click();

  await organiser.getByRole("region", { name: "Twoja ankieta" }).getByRole("button", { name: "Ustal termin" }).click();

  const setTime = organiser.getByRole("region", { name: "Termin" });

  await expect(setTime).toContainText("Niedziela");
  await expect(setTime).toContainText("27 października");
  await expect(setTime).toContainText("18:00–20:00");
});

test("a failed Ustal termin says to check the connection and try again", async ({ browser }, testInfo) => {
  const pollId = seedAnsweredPoll();
  const organiser = await openAsNewDevice(browser, `/e/${pollId}`, pollId);

  await organiser.route(`/e/${pollId}`, (route) => (route.request().method() === "POST" ? route.abort() : route.continue()));
  await organiser.getByRole("region", { name: "Twoja ankieta" }).getByRole("button", { name: "Ustal termin" }).click();

  await expect(organiser.getByRole("alert").filter({ hasText: "Nie udało się. Sprawdź internet i spróbuj jeszcze raz." })).toBeVisible();
  await saveScreenshot(organiser, testInfo, "organiser-failed");
});

test("the organiser link restores the organiser controls on a fresh device", async ({ browser }) => {
  const pollId = seedAnsweredPoll();
  const organiser = await openAsNewDevice(browser, `/e/${pollId}`, pollId);

  await openResults(organiser);
  await organiser.getByRole("button", { name: "Więcej" }).click();
  await organiser.getByRole("button", { name: "Link organizatora na inny telefon" }).click();
  await expect(organiser.getByText(/Nie wysyłaj go na grupę/)).toBeVisible();
  const organiserLink = await copied(organiser);

  expect(organiserLink).toBe(`http://localhost:3000/e/${pollId}/organizator/${organiserToken}`);

  const stranger = await openAsNewDevice(browser, `/e/${pollId}`);

  await openResults(stranger);
  await expect(stranger.getByRole("region", { name: "Najlepiej teraz" })).toBeVisible();
  await expect(stranger.getByRole("button", { name: "Przypomnij" })).toHaveCount(0);

  const secondDevice = await openAsNewDevice(browser, organiserLink!);

  await expect(secondDevice).toHaveURL(`/e/${pollId}`);
  await openResults(secondDevice);

  await expect(secondDevice.getByRole("button", { name: "Przypomnij" })).toBeVisible();
  await expect(secondDevice.getByRole("button", { name: "Ustal termin" })).toBeVisible();
});

test("the organiser deletes the poll after confirming", async ({ browser }) => {
  const pollId = seedAnsweredPoll();
  const organiser = await openAsNewDevice(browser, `/e/${pollId}`, pollId);

  await openResults(organiser);
  await organiser.getByRole("button", { name: "Więcej" }).click();

  await organiser.getByRole("button", { name: "Usuń ankietę" }).click();
  await organiser.getByRole("button", { name: "Tak, usuń" }).click();

  await expect(organiser.getByRole("heading", { name: "Tej ankiety już nie ma" })).toBeVisible();
  await organiser.reload();
  await expect(organiser.getByRole("heading", { name: "Tej ankiety już nie ma" })).toBeVisible();
});

const saturdayEvening = { date: saturday, firstHour: 19, lastHour: 21 };

function seedBoardPoll(final?: typeof saturdayEvening) {
  const pollId = seedPoll({ dates: [saturday, sunday], firstHour: 17, hourCount: 5, organiserToken, final });

  seedAnswer(pollId, "Ola", Date.now(), [
    [saturday, 19],
    [saturday, 20],
  ]);

  seedAnswer(pollId, "Michał", Date.now(), [
    [saturday, 18],
    [saturday, 19],
    [saturday, 20],
  ]);

  const zuza = seedAnswer(pollId, "Zuza", Date.now(), [
    [saturday, 19],
    [saturday, 20],
    [saturday, 21],
  ]);

  const kuba = seedAnswer(pollId, "Kuba", Date.now(), [
    [saturday, 19],
    [saturday, 20],
  ]);

  seedAnswer(pollId, "Bartek", Date.now(), [[sunday, 18]]);

  return { pollId, zuza: { pollId, token: zuza }, kuba: { pollId, token: kuba } };
}

const refreshNow = (page: Page) => page.evaluate(() => window.dispatchEvent(new Event("focus")));

test("after Ustal termin a participant sees the invitation with no grid, and can no longer answer", async ({ browser }, testInfo) => {
  const { pollId, zuza, kuba } = seedBoardPoll();
  const newcomer = await openAsNewDevice(browser, `/e/${pollId}`);
  const organiser = await openAsNewDevice(browser, `/e/${pollId}`, pollId, kuba);

  await organiser.getByRole("region", { name: "Twoja ankieta" }).getByRole("button", { name: "Ustal termin" }).click();
  await expect(organiser.getByRole("region", { name: "Termin" })).toContainText("19:00–21:00");

  await newcomer.getByRole("textbox", { name: "Twoje imię" }).fill("Zosia");
  const firstCell = newcomer.getByRole("grid", { name: "Kiedy możesz?" }).getByRole("row").nth(1).getByRole("button").nth(1);

  if (testInfo.project.use.hasTouch) await firstCell.tap();
  else await firstCell.click();

  await expect(newcomer.getByRole("alert").filter({ hasText: "Termin jest już ustalony, odpowiedzi są zamknięte." })).toBeVisible();
  await saveScreenshot(newcomer, testInfo, "answer-closed");

  await refreshNow(newcomer);
  await expect(newcomer.getByRole("region", { name: "Termin" })).toContainText("Sobota");
  await expect(newcomer.getByRole("grid")).toHaveCount(0);
  await expect(newcomer.getByRole("tab")).toHaveCount(0);
  await expect(newcomer.getByRole("button", { name: /Nie mogę/ })).toHaveCount(0);
  await expect(newcomer.getByText("Ustalone", { exact: true })).toBeVisible();

  const participant = await openAsNewDevice(browser, `/e/${pollId}`, undefined, zuza);
  const setTime = participant.getByRole("region", { name: "Termin" });

  await expect(setTime).toContainText("Sobota");
  await expect(setTime).toContainText("26 października");
  await expect(setTime).toContainText("19:00–21:00");
  await expect(participant.getByText("Ustalone przez: Kuba")).toBeVisible();

  const whoComes = participant.getByRole("region", { name: "Kto będzie" });

  await expect(whoComes).toContainText("Będą 4 osoby");

  expect(
    await whoComes
      .getByRole("list", { name: "Będzie" })
      .getByRole("img")
      .evaluateAll((avatars) => avatars.map((avatar) => avatar.getAttribute("aria-label"))),
  ).toEqual(["Ola", "Michał", "Zuza", "Kuba"]);

  await expect(whoComes.getByRole("listitem").filter({ hasText: "organizator" }).getByRole("img")).toHaveAccessibleName("Kuba");

  await expect(whoComes).toContainText("Bartek nie może.");
  await expect(participant.getByRole("button", { name: "Zmień termin" })).toHaveCount(0);
  await saveScreenshot(participant, testInfo, "set-participant");

  await participant.getByRole("button", { name: "Dodaj do kalendarza" }).click();
  const calendarMenu = participant.getByRole("dialog", { name: "Dodaj do kalendarza" });

  await expect(calendarMenu).toBeVisible();
  await saveScreenshot(participant, testInfo, "set-calendar-menu");
  const google = new URL((await calendarMenu.getByRole("link", { name: "Kalendarz Google" }).getAttribute("href"))!);

  expect(`${google.origin}${google.pathname}`).toBe("https://calendar.google.com/calendar/render");

  expect(Object.fromEntries(google.searchParams)).toEqual({
    action: "TEMPLATE",
    text: "Planszówki u Michała",
    dates: "20301026T170000Z/20301026T190000Z",
    details: `http://localhost:3000/e/${pollId}`,
  });

  const outlook = new URL((await calendarMenu.getByRole("link", { name: "Outlook" }).getAttribute("href"))!);

  expect(`${outlook.origin}${outlook.pathname}`).toBe("https://outlook.live.com/calendar/0/deeplink/compose");
  expect(outlook.searchParams.get("startdt")).toBe("2030-10-26T17:00:00Z");
  expect(outlook.searchParams.get("enddt")).toBe("2030-10-26T19:00:00Z");
  const apple = await participant.request.get((await calendarMenu.getByRole("link", { name: "Kalendarz Apple" }).getAttribute("href"))!);

  expect(apple.headers()["content-type"]).toBe("text/calendar; charset=utf-8");
  expect(apple.headers()["content-disposition"]).toBe('inline; filename="termin.ics"');

  expect((await apple.text()).split("\r\n")).toEqual(
    expect.arrayContaining(["DTSTART:20301026T170000Z", "DTEND:20301026T190000Z", `URL:https://wpasuj.example/e/${pollId}`]),
  );

  await participant.keyboard.press("Escape");
  await expect(calendarMenu).toHaveCount(0);

  await participant.getByRole("button", { name: "Wyślij termin na grupę" }).click();

  await expect
    .poll(() => copied(participant))
    .toBe(`Planszówki u Michała: Sobota 26 października, 19:00–21:00. http://localhost:3000/e/${pollId}`);
});

test("on a desktop the calendar menu drops from its button at its width", async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name.startsWith("phone"), "the calendar menu is a bottom sheet on a phone");
  const { pollId } = seedBoardPoll(saturdayEvening);

  for (const width of [1024, 1440]) {
    for (const asOrganiserOf of [undefined, pollId]) {
      const page = await openAsNewDevice(browser, `/e/${pollId}`, asOrganiserOf);
      const opener = page.getByRole("button", { name: "Dodaj do kalendarza" });
      const menu = page.getByRole("dialog", { name: "Dodaj do kalendarza" });

      await page.setViewportSize({ width, height: 900 });
      await opener.click({ delay: 300 });
      await expect(menu).toBeVisible();
      await settleAnimations(page);
      const [button, box] = await Promise.all([opener.boundingBox(), menu.boundingBox()]);

      expect(box!.x).toBeCloseTo(button!.x, 0);
      expect(box!.width).toBeCloseTo(button!.width, 0);
      expect(box!.y).toBeGreaterThan(button!.y + button!.height);
      await saveScreenshot(page, testInfo, `set-calendar-menu-${width}${asOrganiserOf ? "-organiser" : ""}`);
      await page.context().close();
    }
  }
});

test("Zobacz wszystkie głosy shows every vote read-only to a participant", async ({ browser }, testInfo) => {
  const { pollId, zuza } = seedBoardPoll(saturdayEvening);
  const participant = await openAsNewDevice(browser, `/e/${pollId}`, undefined, zuza);

  await participant.getByRole("button", { name: "Zobacz wszystkie głosy" }).click();

  const votes = participant.getByRole(testInfo.project.name.startsWith("phone") ? "dialog" : "region", { name: "Wszystkie głosy" });
  const heatmap = votes.getByRole("grid", { name: "Kto może" });

  await expect(heatmap).toBeVisible();
  await expect(heatmap).not.toHaveAttribute("aria-multiselectable");
  await expect(heatmap.getByRole("button", { name: "sb 26, 19:00, 4 z 5 może" })).not.toHaveAttribute("data-best");
  await expect(participant.getByRole("textbox", { name: "Twoje imię" })).toHaveCount(0);
  await saveScreenshot(participant, testInfo, "set-votes");
});

test("a tap opens the votes sheet without a focus ring", async ({ browser }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("phone"), "the sheet is phone only");
  const { pollId, zuza } = seedBoardPoll(saturdayEvening);
  const participant = await openAsNewDevice(browser, `/e/${pollId}`, undefined, zuza);

  await participant.getByRole("button", { name: "Zobacz wszystkie głosy" }).tap();

  const votes = participant.getByRole("dialog", { name: "Wszystkie głosy" });

  await expect(votes.getByRole("grid", { name: "Kto może" })).toBeVisible();
  await expect(participant.locator(":focus-visible")).toHaveCount(0);
  await saveScreenshot(participant, testInfo, "set-votes-tap");
});

test("the keyboard opens the votes sheet with the focus ring on the sheet", async ({ browser }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("phone"), "the sheet is phone only");
  const { pollId, zuza } = seedBoardPoll(saturdayEvening);
  const participant = await openAsNewDevice(browser, `/e/${pollId}`, undefined, zuza);

  await participant.getByRole("button", { name: "Zobacz wszystkie głosy" }).press("Enter");

  const votes = participant.getByRole("dialog", { name: "Wszystkie głosy" });

  await expect(votes).toBeFocused();
  await expect(participant.locator(":focus-visible")).toHaveCount(1);
  await saveScreenshot(participant, testInfo, "set-votes-keyboard");
});

test("Zmień termin returns the organiser and a participant to the open poll", async ({ browser }, testInfo) => {
  const { pollId, zuza, kuba } = seedBoardPoll(saturdayEvening);
  const organiser = await openAsNewDevice(browser, `/e/${pollId}`, pollId, kuba);
  const participant = await openAsNewDevice(browser, `/e/${pollId}`, undefined, zuza);

  await expect(organiser.getByText("Ustalone przez Ciebie")).toBeVisible();
  await saveScreenshot(organiser, testInfo, "set-organiser");

  await organiser.getByRole("region", { name: "Twoja ankieta" }).getByRole("button", { name: "Zmień termin" }).click();

  await expect(organiser.getByRole("tab", { name: "Moje" })).toBeVisible();
  await expect(organiser.getByRole("region", { name: "Termin" })).toHaveCount(0);
  await expect(organiser.getByRole("button", { name: "Ustal termin" })).toBeVisible();
  await refreshNow(participant);
  await expect(participant.getByRole("tab", { name: "Moje" })).toBeVisible();
  await expect(participant.getByRole("region", { name: "Termin" })).toHaveCount(0);
  await participant.getByRole("tab", { name: "Moje" }).click();
  await expect(participant.getByRole("grid", { name: "Kiedy możesz?" })).toBeVisible();
});
