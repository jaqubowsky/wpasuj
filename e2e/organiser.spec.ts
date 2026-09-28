import type { Browser, Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { readFile } from "node:fs/promises";
import { stubClipboardWithoutShareSheet } from "./clipboard";
import { saveScreenshot } from "./screenshot";
import { seedAnswer, seedPoll } from "./seed";

const saturday = "2030-10-26";
const sunday = "2030-10-27";
const organiserToken = "organiser-token-for-the-e2e-poll-0123456789";

function seedAnsweredPoll() {
  const pollId = seedPoll({ dates: [saturday, sunday], firstHour: 17, hourCount: 4, organiserToken });
  seedAnswer(pollId, "Ola", Date.now(), [[saturday, 17], [sunday, 18], [sunday, 19]]);
  seedAnswer(pollId, "Bartek", Date.now(), [[saturday, 18], [sunday, 18], [sunday, 19]]);
  seedAnswer(pollId, "Michał", Date.now(), [[saturday, 17], [saturday, 18], [sunday, 18], [sunday, 19]]);
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

  await expect.poll(() => copied(organiser)).toBe(
    `Już są: Ola, Bartek i Michał. Reszta, kiedy możecie? Planszówki u Michała http://localhost:3000/e/${pollId}`,
  );

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
  seedAnswer(pollId, "Ola", Date.now(), [[saturday, 19], [saturday, 20]]);
  seedAnswer(pollId, "Michał", Date.now(), [[saturday, 18], [saturday, 19], [saturday, 20]]);
  const zuza = seedAnswer(pollId, "Zuza", Date.now(), [[saturday, 19], [saturday, 20], [saturday, 21]]);
  const kuba = seedAnswer(pollId, "Kuba", Date.now(), [[saturday, 19], [saturday, 20]]);
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
  await expect(participant.getByRole("list", { name: "Będzie" }).getByRole("listitem")).toHaveText(["OOla", "MMichał", "ZZuza, to Ty", "KKuba, organizator"]);
  await expect(participant.getByRole("list", { name: "Nie może" }).getByRole("listitem")).toHaveText(["BBartek, nie może"]);
  await expect(participant.getByRole("button", { name: "Zmień termin" })).toHaveCount(0);
  await saveScreenshot(participant, testInfo, "set-participant");

  const download = participant.waitForEvent("download");
  await setTime.getByRole("link", { name: "Dodaj do kalendarza" }).click();
  const calendar = await readFile((await (await download).path())!, "utf8");
  expect(calendar.split("\r\n")).toEqual(expect.arrayContaining(["DTSTART:20301026T170000Z", "DTEND:20301026T190000Z"]));

  await participant.getByRole("button", { name: "Wyślij termin na grupę" }).click();
  await expect.poll(() => copied(participant)).toBe(`Planszówki u Michała: Sobota 26 października, 19:00–21:00. http://localhost:3000/e/${pollId}`);
});

test("Zobacz wszystkie głosy shows every vote read-only to a participant", async ({ browser }, testInfo) => {
  const { pollId, zuza } = seedBoardPoll(saturdayEvening);
  const participant = await openAsNewDevice(browser, `/e/${pollId}`, undefined, zuza);

  await participant.getByRole("button", { name: "Zobacz wszystkie głosy" }).click();

  const votes = participant.getByRole(testInfo.project.name.startsWith("phone") ? "dialog" : "region", { name: "Wszystkie głosy" });
  const heatmap = votes.getByRole("grid", { name: "Kto może" });
  await expect(heatmap).toBeVisible();
  await expect(heatmap).not.toHaveAttribute("aria-multiselectable");
  await expect(heatmap.getByRole("button", { name: "sb 26, 19:00, 4 z 5 może" })).toHaveAttribute("data-best");
  await expect(participant.getByRole("textbox", { name: "Twoje imię" })).toHaveCount(0);
  await saveScreenshot(participant, testInfo, "set-votes");
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
