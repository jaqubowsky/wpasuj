import { expect, test, type Page } from "@playwright/test";
import { saveScreenshot } from "./screenshot";

declare global {
  interface Window {
    shared?: ShareData;
    copied?: string;
  }
}

async function stubShareSheet(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async (data: ShareData) => {
        window.shared = data;
      },
    });
  });
}

async function stubClipboardWithoutShareSheet(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          window.copied = text;
        },
      },
    });
  });
}

const createButton = (page: Page) => page.getByRole("button", { name: "Utwórz i wyślij na grupę" });
async function createPoll(page: Page, { title, day, name }: { title: string; day: string; name: string }) {
  await page.getByRole("textbox", { name: "Co robimy?" }).fill(title);
  await page.getByRole("button", { name: day }).click();
  await page.getByRole("textbox", { name: "Twoje imię" }).fill(name);
  await createButton(page).click();
}

const days = (page: Page) => page.getByRole("group", { name: "Dni" }).getByRole("button");

test("the organiser creates a weekend evening poll, shares it and lands on it", async ({ page }, testInfo) => {
  await stubShareSheet(page);
  await page.goto("/");
  await expect(days(page).first()).toBeVisible();
  await saveScreenshot(page, testInfo, "create-empty");
  const started = Date.now();

  await page.getByRole("textbox", { name: "Co robimy?" }).fill("Planszówki u Michała");
  await page.getByRole("button", { name: "Ten weekend" }).click();
  await expect(page.getByRole("button", { name: "Wieczór 17–23", pressed: true })).toBeVisible();
  await page.getByRole("textbox", { name: "Twoje imię" }).fill("Kuba");
  await saveScreenshot(page, testInfo, "create-filled");
  await createButton(page).click();

  await expect(page).toHaveURL(/\/e\/[A-Za-z0-9_-]{10}$/);
  expect(Date.now() - started).toBeLessThan(30_000);
  expect(await page.evaluate(() => window.shared)).toEqual({ text: `Kiedy możecie? Planszówki u Michała ${page.url()}` });
  await expect(page.getByText("Kuba pyta")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Planszówki u Michała" })).toBeVisible();
  await expect(page.getByText("Bądź pierwszy")).toBeVisible();
  await expect(page.getByRole("tab", { name: "Moje", selected: true })).toBeVisible();
  await expect(page.getByRole("tabpanel", { name: "Moje" })).toBeAttached();
  await saveScreenshot(page, testInfo, "poll-shell");

  await page.getByRole("tab", { name: "Wszyscy" }).click();
  await expect(page.getByRole("tabpanel", { name: "Wszyscy" })).toBeAttached();
});

test("without a share sheet the link is copied and the organiser still lands on the poll", async ({ page }) => {
  await stubClipboardWithoutShareSheet(page);
  await page.goto("/");

  await createPoll(page, { title: "Kino", day: "Jutro", name: "Ola" });

  await expect(page.getByText("Link skopiowany")).toBeVisible();
  await expect(page).toHaveURL(/\/e\/[A-Za-z0-9_-]{10}$/);
  expect(await page.evaluate(() => window.copied)).toBe(page.url());
});

test("the name used last on this device is prefilled", async ({ page }) => {
  await stubShareSheet(page);
  await page.goto("/");
  await createPoll(page, { title: "Kino", day: "Jutro", name: "Ola" });
  await expect(page).toHaveURL(/\/e\//);

  await page.goto("/");

  await expect(page.getByRole("textbox", { name: "Twoje imię" })).toHaveValue("Ola");
});

test("Własne, the month and the 10-day limit", async ({ page }, testInfo) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Własne" }).click();
  await expect(page.getByRole("group", { name: "od" })).toBeVisible();
  await saveScreenshot(page, testInfo, "create-wlasne");

  await page.getByRole("button", { name: "Pokaż cały miesiąc" }).click();
  await expect(days(page)).toHaveCount(42);
  await saveScreenshot(page, testInfo, "create-month-open");

  await page.getByRole("button", { name: "Przyszły tydzień" }).click();
  const free = page.getByRole("group", { name: "Dni" }).locator('button[aria-pressed="false"]:enabled');
  for (let picked = 7; picked < 10; picked++) await free.last().click();
  await free.last().click();

  await expect(page.getByText("Maksymalnie 10 dni")).toBeVisible();
  await expect(page.getByRole("group", { name: "Dni" }).locator('button[aria-pressed="true"]')).toHaveCount(10);
  await saveScreenshot(page, testInfo, "create-limit");
});

test("inputs render at 16px or more", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Własne" }).click();

  for (const input of await page.locator("input, output").all()) {
    const size = await input.evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
    expect(size).toBeGreaterThanOrEqual(16);
  }
});

test("the create button sits above the safe area", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("phone"), "the sticky bar is a phone layout");
  await page.goto("/");

  const bar = createButton(page).locator("..");
  await expect(bar).toHaveCSS("position", "fixed");
  await expect(bar).toHaveCSS("bottom", "0px");
  const viewport = page.viewportSize()!;
  const button = (await createButton(page).boundingBox())!;
  expect(button.y + button.height).toBeLessThanOrEqual(viewport.height - 12);
});

test("a poll that does not exist says it is gone and links to a new one", async ({ page }, testInfo) => {
  await page.goto("/e/abcdefghij");

  await expect(page.getByRole("heading", { name: "Tej ankiety już nie ma" })).toBeVisible();
  await saveScreenshot(page, testInfo, "poll-gone");
  await page.getByRole("link", { name: "Zrób nową ankietę" }).click();

  await expect(page.getByRole("textbox", { name: "Co robimy?" })).toBeVisible();
});
