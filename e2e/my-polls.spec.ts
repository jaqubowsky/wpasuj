import type { Locator, Page, TestInfo } from "@playwright/test";
import { expectAccessible } from "./accessibility";
import { expect, test } from "./fixtures";
import { settleAnimations } from "./screenshot";
import { seedPoll } from "./seed";

const header = (page: Page) => page.getByRole("banner");
const myPollsButton = (page: Page) => header(page).getByRole("button", { name: /^Moje ankiety/ });
const createButton = (page: Page) => header(page).getByRole("button", { name: /^Utwórz/ });
const list = (page: Page) => page.getByRole("dialog", { name: "Twoje ankiety" });

const desktop = (testInfo: TestInfo) => testInfo.project.name === "desktop-chromium";

async function tap(target: Locator, testInfo: TestInfo) {
  if (testInfo.project.use.hasTouch) await target.tap();
  else await target.click();
}

async function saveHeader(page: Page, testInfo: TestInfo, screen: string) {
  await settleAnimations(page);
  await header(page).screenshot({ path: `e2e/screenshots/${screen}-${testInfo.project.name}.png` });
}

async function createPoll(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { configurable: true, value: async () => {} });
  });

  await page.goto("/");
  await page.getByRole("textbox", { name: "Co robimy?" }).fill("Kino w piątek");
  await page.getByRole("button", { name: "Przyszły tydzień" }).click();
  await page.getByRole("textbox", { name: "Twoje imię" }).fill("Ola");
  await page.getByRole("button", { name: "Utwórz i wyślij na grupę" }).click();
  await expect(page).toHaveURL(/\/e\/[A-Za-z0-9_-]{10}$/);

  return new URL(page.url()).pathname;
}

async function answerPoll(page: Page, testInfo: TestInfo, pollId: string) {
  await page.goto(`/e/${pollId}`);
  await page.getByRole("tab", { name: "Moje" }).click();
  await page.getByRole("textbox", { name: "Twoje imię" }).fill("Ola");
  await tap(page.getByRole("grid", { name: "Kiedy możesz?" }).getByRole("row").nth(1).getByRole("button").nth(1), testInfo);
  await expect(page.getByRole("status")).toHaveText("Zapisane");
}

test("a device with no polls sees the header without Moje ankiety", async ({ page }, testInfo) => {
  await page.goto("/");

  await expect(createButton(page)).toHaveAccessibleName("Utwórz ankietę");
  await expect(header(page).getByRole("button", { name: /^Moje/ })).toHaveCount(0);
  await saveHeader(page, testInfo, "my-polls-header-none");
});

test("a device that created one poll and answered another opens both from the header", async ({ page }, testInfo) => {
  const answered = seedPoll({ dates: ["2030-10-25", "2030-10-26"], firstHour: 18, hourCount: 4, title: "Grill u Bartka" });

  await answerPoll(page, testInfo, answered);
  const created = await createPoll(page);

  await page.goto("/");

  await expect(myPollsButton(page)).toHaveAccessibleName("Moje ankiety, 2");
  await expect(myPollsButton(page)).toHaveText(desktop(testInfo) ? /^Moje ankiety\s+2$/ : /^Moje\s+2$/, { useInnerText: true });
  await expect(createButton(page)).toHaveAccessibleName(desktop(testInfo) ? "Utwórz ankietę" : "Utwórz");
  expect((await myPollsButton(page).boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await saveHeader(page, testInfo, "my-polls-header");

  await tap(myPollsButton(page), testInfo);
  const rows = list(page).getByRole("link");

  await expect(rows).toHaveCount(2);
  await expect(rows.nth(0)).toContainText("Kino w piątek");
  await expect(rows.nth(0)).toContainText("Twoja ankieta · ");
  await expect(rows.nth(0)).toContainText("Nikt jeszcze nie odpowiedział");
  await expect(rows.nth(1)).toContainText("Grill u Bartka");
  await expect(rows.nth(1)).toContainText("Odpowiadasz · pt 25.10 – sb 26.10");
  await expect(rows.nth(1)).toContainText("1 osoba odpowiedziała");

  await expect(
    list(page).getByText(desktop(testInfo) ? "Widać je tylko w tej przeglądarce." : "Widać je tylko na tym telefonie."),
  ).toBeVisible();

  await settleAnimations(page);
  const box = (await list(page).boundingBox())!;
  const viewport = page.viewportSize()!;

  if (desktop(testInfo)) {
    expect(box).toEqual({ x: viewport.width - 420, y: 0, width: 420, height: viewport.height });
  } else {
    expect(box.width).toBe(viewport.width);
    expect(box.y + box.height).toBe(viewport.height);
  }

  await page.screenshot({ path: `e2e/screenshots/my-polls-open-${testInfo.project.name}.png` });
  await expectAccessible(page);

  await tap(rows.nth(0), testInfo);
  await expect(page).toHaveURL(created);
});

test("the open list keeps focus inside and gives it back to the button on close", async ({ page }) => {
  const pollId = seedPoll({
    dates: ["2030-10-25"],
    firstHour: 18,
    hourCount: 4,
    final: { date: "2030-10-25", firstHour: 19, lastHour: 21 },
  });

  await page.addInitScript((id) => {
    localStorage.setItem("device-polls", JSON.stringify([{ id, role: "participant", lastDate: "2030-10-25" }]));
  }, pollId);

  await page.goto("/");
  await myPollsButton(page).focus();
  await page.keyboard.press("Enter");
  await expect(list(page).getByRole("link")).toContainText("Ustalone: piątek 25.10, 19–21");

  const focused: (string | null)[] = [];

  for (let step = 0; step < 6; step++) {
    await page.keyboard.press("Tab");

    focused.push(
      await page.evaluate(() => {
        const active = document.activeElement;

        if (!active || active === document.body) return null;

        return active.closest("dialog") ? active.textContent : "outside the list";
      }),
    );
  }

  expect(focused).not.toContain("outside the list");
  expect(focused).toContain("Zamknij");
  expect(focused.some((text) => text?.includes("Ustalone"))).toBe(true);

  await page.keyboard.press("Escape");

  await expect(list(page)).toBeHidden();
  await expect(myPollsButton(page)).toBeFocused();
});

test("an expired poll and a deleted one are neither listed nor counted", async ({ page }) => {
  const live = seedPoll({ dates: ["2030-10-25"], firstHour: 18, hourCount: 4, title: "Rower" });

  await page.addInitScript((liveId) => {
    localStorage.setItem(
      "device-polls",
      JSON.stringify([
        { id: "gone-12345", role: "participant", lastDate: "2030-10-25" },
        { id: "old-123456", role: "organiser", lastDate: "2026-01-10" },
        { id: liveId, role: "organiser", lastDate: "2030-10-25" },
      ]),
    );
  }, live);

  await page.goto("/");

  await myPollsButton(page).click();

  await expect(list(page).getByRole("link")).toHaveCount(1);
  await expect(list(page).getByRole("link")).toContainText("Rower");
  await list(page).getByRole("button", { name: "Zamknij" }).click();
  await expect(myPollsButton(page)).toHaveAccessibleName("Moje ankiety, 1");
});

test("a click in the list's empty space keeps it open", async ({ page }) => {
  const pollId = seedPoll({ dates: ["2030-10-25"], firstHour: 18, hourCount: 4 });

  await page.addInitScript((id) => {
    localStorage.setItem("device-polls", JSON.stringify([{ id, role: "participant", lastDate: "2030-10-25" }]));
  }, pollId);

  await page.goto("/");
  await myPollsButton(page).click();
  await expect(list(page).getByRole("link")).toHaveCount(1);
  await settleAnimations(page);
  const box = (await list(page).boundingBox())!;

  await page.mouse.click(box.x + box.width / 2, box.y + box.height - 12);

  await expect(list(page)).toBeVisible();
});
