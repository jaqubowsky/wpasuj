import { expect, test, type Browser, type Page } from "@playwright/test";
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

async function openAsNewDevice(browser: Browser, path: string, asOrganiserOf?: string) {
  const context = await browser.newContext(test.info().project.use);
  if (asOrganiserOf) {
    await context.addCookies([{ name: `${asOrganiserOf}-org`, value: organiserToken, url: "http://localhost:3000" }]);
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

test("the organiser reminds and sets the time; a participant downloads it and can no longer answer", async ({ browser }, testInfo) => {
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

  await expect(organiser.getByRole("region", { name: "Ustalone" })).toContainText("Niedziela 27.10, 18:00");
  await saveScreenshot(organiser, testInfo, "final-time");

  const participant = await openAsNewDevice(browser, `/e/${pollId}`);
  const final = participant.getByRole("region", { name: "Ustalone" });
  await expect(final).toContainText("Niedziela 27.10, 18:00");
  await expect(final.getByRole("button", { name: "Zmień" })).toHaveCount(0);
  await expect(participant.getByRole("link", { name: "Zrób własną ankietę" })).toHaveAttribute("href", "/");

  const download = participant.waitForEvent("download");
  await final.getByRole("link", { name: "Dodaj do kalendarza" }).click();
  const calendar = await readFile((await (await download).path())!, "utf8");

  expect(calendar.split("\r\n")).toEqual(expect.arrayContaining(["DTSTART:20301027T170000Z", "DTEND:20301027T190000Z"]));

  await participant.getByRole("textbox", { name: "Twoje imię" }).fill("Zosia");
  const firstCell = participant.getByRole("grid", { name: "Kiedy możesz?" }).getByRole("row").nth(1).getByRole("button").nth(1);
  if (testInfo.project.use.hasTouch) await firstCell.tap();
  else await firstCell.click();

  await expect(participant.getByRole("alert").filter({ hasText: "Termin jest już ustalony, odpowiedzi są zamknięte." })).toBeVisible();

  await organiser.getByRole("region", { name: "Ustalone" }).getByRole("button", { name: "Zmień" }).click();

  await expect(organiser.getByRole("region", { name: "Ustalone" })).toHaveCount(0);
  await expect(organiser.getByRole("button", { name: "Ustal termin" })).toBeVisible();
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
