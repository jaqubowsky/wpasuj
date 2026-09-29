import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { stubClipboardWithoutShareSheet } from "./clipboard";
import { saveScreenshot, settleAnimations } from "./screenshot";

declare global {
  interface Window {
    shared?: { data: ShareData; fromTap: boolean }[];
  }
}

async function stubShareSheet(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async (data: ShareData) => {
        window.shared = [...(window.shared ?? []), { data, fromTap: navigator.userActivation.isActive }];
      },
    });
  });
}

async function holdCreateAction(page: Page) {
  let release = () => {};
  let onHeld = () => {};
  const held = new Promise<void>((resolve) => (onHeld = resolve));

  await page.route("/", async (route) => {
    if (route.request().method() !== "POST") return route.continue();

    onHeld();
    await new Promise<void>((resolve) => (release = resolve));
    await route.continue();
  });

  return { held, release: () => release() };
}

async function countViewTransitions(page: Page) {
  await page.addInitScript(() => {
    const started: string[] = [];

    Object.defineProperty(window, "viewTransitions", { value: started });
    const start = document.startViewTransition?.bind(document);

    if (start) document.startViewTransition = (update) => (started.push(location.pathname), start(update));
  });

  return () => page.evaluate(() => (window as unknown as { viewTransitions: string[] }).viewTransitions.length);
}

const namedForTransition = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll("*")]
      .map((element) => getComputedStyle(element).viewTransitionName)
      .filter((name) => name !== "none" && name !== "root"),
  );

const inviteCard = (page: Page) => page.getByRole("region", { name: "Ankieta gotowa" });

const createButton = (page: Page) => page.getByRole("button", { name: "Utwórz i wyślij na grupę" });

async function createPoll(page: Page, { title, day, name }: { title: string; day: string; name: string }) {
  await page.getByRole("textbox", { name: "Co robimy?" }).fill(title);
  await page.getByRole("button", { name: day }).click();
  await page.getByRole("textbox", { name: "Twoje imię" }).fill(name);
  await createButton(page).click();
}

const days = (page: Page) => page.getByRole("group", { name: "Dni" }).getByRole("button");

test("the organiser creates a weekend evening poll, lands on the invite card and sends it", async ({ page }, testInfo) => {
  await stubShareSheet(page);
  await page.goto("/");
  await expect(days(page).first()).toBeVisible();
  await saveScreenshot(page, testInfo, "create-empty");
  const started = Date.now();

  await page.getByRole("textbox", { name: "Co robimy?" }).fill("Planszówki u Michała");
  await page.getByRole("button", { name: "Ten weekend" }).click();

  await expect(
    page.getByRole("group", { name: "O której?" }).getByText("17:00 → 23:00 · 6 godzin").filter({ visible: true }),
  ).toBeVisible();

  await page.getByRole("textbox", { name: "Twoje imię" }).fill("Kuba");
  await saveScreenshot(page, testInfo, "create-filled");
  const action = await holdCreateAction(page);

  await createButton(page).click();

  await action.held;
  await expect(page.getByRole("button", { name: "Tworzę ankietę…" })).toBeVisible();
  await expect(page).toHaveURL("/");
  await saveScreenshot(page, testInfo, "create-pending");
  action.release();

  await expect(page).toHaveURL(/\/e\/[A-Za-z0-9_-]{10}$/);
  expect(Date.now() - started).toBeLessThan(30_000);
  expect(await page.evaluate(() => window.shared)).toBeUndefined();
  await expect(page.getByRole("heading", { level: 1, name: "Planszówki u Michała" })).toBeVisible();
  await expect(inviteCard(page)).toContainText(`localhost:3000${new URL(page.url()).pathname}`);
  await saveScreenshot(page, testInfo, "invite-card");

  await inviteCard(page).getByRole("button", { name: "Wyślij na grupę" }).click();

  await expect(page.getByText("Wysłane. Odpowiedzi pojawią się tutaj.")).toBeVisible();

  expect(await page.evaluate(() => window.shared)).toEqual([
    { data: { text: `Kiedy możecie? Planszówki u Michała ${page.url()}` }, fromTap: true },
  ]);

  await expect(inviteCard(page)).toHaveCount(0);
  await saveScreenshot(page, testInfo, "invite-sent");

  await page.reload();
  await expect(page.getByText("Pytasz jako Kuba")).toBeVisible();
  await expect(page.getByText("Bądź pierwszy")).toBeVisible();
  await expect(page.getByRole("tab", { name: "Moje", selected: true })).toBeVisible();
  await expect(page.getByRole("tabpanel", { name: "Moje" })).toBeAttached();
  await expect(inviteCard(page)).toHaveCount(0);
  await expect(page.getByText("Wysłane. Odpowiedzi pojawią się tutaj.")).toHaveCount(0);
  await saveScreenshot(page, testInfo, "poll-shell");

  await page.getByRole("tab", { name: "Wszyscy" }).click();
  await expect(page.getByRole("tabpanel", { name: "Wszyscy" })).toBeAttached();
});

test("on a slow network the spinner keeps moving and the form morphs only once the poll has arrived", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes("webkit"), "the view transition count is read in Chromium");
  await stubShareSheet(page);
  const viewTransitions = await countViewTransitions(page);
  let release = () => {};
  let onHeld = () => {};
  const held = new Promise<void>((resolve) => (onHeld = resolve));
  let holding = true;

  await page.route(/\/e\/[A-Za-z0-9_-]{10}(\?.*)?$/, async (route) => {
    if (!holding) return route.continue();

    holding = false;
    onHeld();
    await new Promise<void>((resolve) => (release = resolve));
    await route.continue();
  });

  await page.goto("/");

  await createPoll(page, { title: "Kino", day: "Jutro", name: "Ola" });
  await held;

  const spinner = page.getByRole("button", { name: "Tworzę ankietę…" }).locator("[data-create-spinner]");
  const turned = () => spinner.evaluate((element) => element.getAnimations()[0].currentTime);
  const before = await turned();

  await expect.poll(turned).not.toBe(before);
  expect(await viewTransitions()).toBe(0);
  release();

  await expect(page).toHaveURL(/\/e\/[A-Za-z0-9_-]{10}$/);
  await expect(inviteCard(page)).toBeVisible();
  expect(await viewTransitions()).toBe(1);
  await expect.poll(() => namedForTransition(page)).toEqual([]);
  await page.getByRole("tab", { name: "Wszyscy" }).click();
  await expect(page.getByRole("tab", { name: "Wszyscy", selected: true })).toBeVisible();
  expect(await namedForTransition(page)).toEqual([]);
});

test("Kopiuj copies the link, says Skopiowano and keeps the card", async ({ page }, testInfo) => {
  await stubClipboardWithoutShareSheet(page);
  await page.goto("/");

  await createPoll(page, { title: "Kino", day: "Jutro", name: "Ola" });
  await expect(page).toHaveURL(/\/e\/[A-Za-z0-9_-]{10}$/);
  await inviteCard(page).getByRole("button", { name: "Kopiuj" }).click();

  await expect(inviteCard(page).getByRole("button", { name: "Skopiowano" })).toBeVisible();
  expect(await page.evaluate(() => window.copied)).toBe(page.url());
  await saveScreenshot(page, testInfo, "invite-copied");
  await expect(inviteCard(page).getByRole("button", { name: "Kopiuj" })).toBeVisible();
});

test("the name used last on this device is prefilled", async ({ page }) => {
  await stubShareSheet(page);
  await page.goto("/");
  await createPoll(page, { title: "Kino", day: "Jutro", name: "Ola" });
  await expect(page).toHaveURL(/\/e\//);

  await page.goto("/");

  await expect(page.getByRole("textbox", { name: "Twoje imię" })).toHaveValue("Ola");
});

test("the organiser asks for 22:00 to 4:00 and a night run reads 23–1", async ({ page }, testInfo) => {
  await stubShareSheet(page);
  await page.goto("/");
  await expect(days(page).last()).toBeEnabled();

  if (testInfo.project.name.startsWith("desktop")) {
    const tiles = page.getByRole("group", { name: "Godziny" });

    await tiles.getByRole("button", { name: "22:00", exact: true }).click();
    await expect(page.getByText("Od 22:00, teraz kliknij koniec").filter({ visible: true })).toBeVisible();
    await tiles.getByRole("button", { name: "3:00", exact: true }).click();
    await expect(tiles.getByRole("button", { pressed: true })).toHaveText(["22", "23", "0", "1", "2", "3"]);
    await expect(page.getByText("22:00 → 4:00 · 6 godzin").filter({ visible: true })).toBeVisible();
    await saveScreenshot(page, testInfo, "create-hours");
  } else {
    await page.getByRole("button", { name: "Od 17:00" }).click();
    const sheet = page.getByRole("dialog", { name: "O której?" });

    await sheet.getByRole("group", { name: "Od" }).getByRole("button", { name: "22:00", exact: true }).click();

    const [late, later] = await Promise.all(
      ["22:00", "23:00"].map((hour) =>
        sheet.getByRole("group", { name: "Od" }).getByRole("button", { name: hour, exact: true }).boundingBox(),
      ),
    );

    expect(later!.y - (late!.y + late!.height)).toBeGreaterThanOrEqual(6);
    await sheet.getByRole("group", { name: "Do" }).getByRole("button", { name: "4:00", exact: true }).click();
    await expect(sheet.getByText("22:00 → 4:00 · 6 godzin")).toBeVisible();
    await settleAnimations(page);
    await page.screenshot({ path: `e2e/screenshots/create-hours-${testInfo.project.name}.png` });
    await sheet.getByRole("button", { name: "Gotowe" }).click();
    await expect(sheet).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Od 22:00" })).toBeFocused();
    await expect(page.getByRole("button", { name: "Do 4:00" })).toBeVisible();
  }

  await createPoll(page, { title: "Nocne granie", day: "Jutro", name: "Kuba" });
  await expect(page).toHaveURL(/\/e\/[A-Za-z0-9_-]{10}$/);

  const grid = page.getByRole("grid", { name: "Kiedy możesz?" });

  await expect(grid.getByRole("rowheader")).toHaveText(["22:00", "23:00", "0:00", "1:00", "2:00", "3:00"]);
  await grid.getByRole("button", { name: /, 23:00$/ }).click();
  await grid.getByRole("button", { name: /, 0:00$/ }).click();
  await expect(page.getByRole("status")).toHaveText("Zapisane");
  await page.reload();
  await expect(page.getByRole("tab", { name: "Wszyscy", selected: true })).toBeVisible();

  await expect(page.getByRole("region", { name: "Najlepiej" }).getByText(/, 23–1$/)).toBeVisible();
});

test("on desktop the first tile shows as the start, and 2 then 8 runs to 9:00 the next morning", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "the hour tiles are the desktop picker");
  await page.goto("/");
  const tiles = page.getByRole("group", { name: "Godziny" });

  await tiles.getByRole("button", { name: "2:00", exact: true }).click();

  await expect(tiles.getByRole("button", { pressed: true })).toHaveText(["2"]);
  await expect(tiles.getByRole("button", { name: "2:00", exact: true })).toHaveCSS("background-color", "rgb(30, 27, 24)");
  await expect(page.getByText("Od 2:00, teraz kliknij koniec").filter({ visible: true })).toBeVisible();
  await saveScreenshot(page, testInfo, "create-hours-start");

  await tiles.getByRole("button", { name: "8:00", exact: true }).click();

  await expect(tiles.getByRole("button", { pressed: true })).toHaveText(["6", "7", "8", "2", "3", "4", "5"]);
  await expect(page.getByText("2:00 → 9:00 · 7 godzin").filter({ visible: true })).toBeVisible();
});

test("a create that fails says the poll was not created and to check the connection", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.route("/", (route) => (route.request().method() === "POST" ? route.abort() : route.continue()));
  await createPoll(page, { title: "Planszówki u Michała", day: "Ten weekend", name: "Kuba" });

  await expect(
    page.getByRole("alert").filter({ hasText: "Nie udało się utworzyć ankiety. Sprawdź internet i spróbuj jeszcze raz." }),
  ).toBeVisible();

  await expect(page).toHaveURL("/");
  await saveScreenshot(page, testInfo, "create-failed");
});

test("the month and the 10-day limit", async ({ page }, testInfo) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Pokaż cały miesiąc" }).click();
  await expect(days(page)).toHaveCount(42);
  await saveScreenshot(page, testInfo, "create-month-open");

  await page.getByRole("button", { name: "Przyszły tydzień" }).click();
  const free = page.getByRole("group", { name: "Dni" }).locator('button[aria-pressed="false"]:enabled');

  for (let picked = 7; picked < 10; picked++) await free.last().click();
  await free.last().click();

  await expect(page.getByText("Maksymalnie 10 dni")).toBeVisible();
  const selected = page.getByRole("group", { name: "Dni" }).locator('button[aria-pressed="true"]');

  await expect(selected).toHaveCount(10);
  await expect(selected.first()).toHaveCSS("color", "rgb(30, 27, 24)");
  await saveScreenshot(page, testInfo, "create-limit");
});

test("nothing below the dates moves when the page hydrates", async ({ page, browser }) => {
  const firstPaint = await browser.newContext({ viewport: page.viewportSize(), javaScriptEnabled: false });
  const serverRendered = await firstPaint.newPage();

  await serverRendered.goto("http://localhost:3000/");
  const whenHeading = (on: Page) => on.getByText("O której?", { exact: true });
  const before = (await whenHeading(serverRendered).boundingBox())!.y;

  await page.goto("/");
  await expect(days(page).last()).toBeEnabled();

  expect((await whenHeading(page).boundingBox())!.y).toBe(before);
});

test("what the organiser types before the page hydrates still creates the poll", async ({ page }) => {
  let hydrate = () => {};
  const scriptsHeld = new Promise<void>((resolve) => (hydrate = resolve));

  await page.route(/\/_next\/static\/chunks\/.+\.js$/, async (route) => {
    await scriptsHeld;
    await route.continue();
  });

  await stubShareSheet(page);
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await page.getByRole("textbox", { name: "Co robimy?" }).fill("Kino");
  await page.getByRole("textbox", { name: "Twoje imię" }).fill("Ola");
  hydrate();
  await expect(days(page).last()).toBeEnabled();
  await page.getByRole("button", { name: "Jutro" }).click();
  await createButton(page).click();

  await expect(page).toHaveURL(/\/e\/[A-Za-z0-9_-]{10}$/);
  await expect(page.getByText("Pytasz jako Ola", { exact: true })).toBeVisible();
});

test("inputs render at 16px or more", async ({ page }) => {
  await page.goto("/");

  for (const input of await page.locator("input, output").all()) {
    const size = await input.evaluate((element) => parseFloat(getComputedStyle(element).fontSize));

    expect(size).toBeGreaterThanOrEqual(16);
  }
});

test("the create button sits above the safe area", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("phone"), "the sticky bar is a phone layout");
  await page.goto("/");
  await page.getByRole("textbox", { name: "Co robimy?" }).scrollIntoViewIfNeeded();

  const bar = createButton(page).locator("..");

  await expect(bar).toHaveCSS("position", "sticky");
  await expect(bar).toHaveCSS("bottom", "0px");
  const viewport = page.viewportSize()!;
  const button = (await createButton(page).boundingBox())!;

  expect(button.y + button.height).toBeLessThanOrEqual(viewport.height - 12);
});

test.describe("a viewer in London on a Warsaw poll", () => {
  test.use({ timezoneId: "Europe/London" });

  test("reads which zone the hours are in; a viewer in Warsaw does not", async ({ page, browser }, testInfo) => {
    const warsaw = await browser.newContext({ timezoneId: "Europe/Warsaw", baseURL: testInfo.project.use.baseURL });
    const organiser = await warsaw.newPage();

    await stubShareSheet(organiser);
    await organiser.goto("/");
    await createPoll(organiser, { title: "Kino", day: "Jutro", name: "Ola" });
    await expect(organiser).toHaveURL(/\/e\/[A-Za-z0-9_-]{10}$/);
    await expect(organiser.getByText("Pytasz jako Ola", { exact: true })).toBeVisible();

    await page.goto(organiser.url());

    await expect(page.getByText("Godziny w strefie Europe/Warsaw")).toBeVisible();
    await saveScreenshot(page, testInfo, "poll-zone-line");
    await organiser.getByRole("tab", { name: "Wszyscy" }).click();
    await expect(organiser.getByRole("tab", { name: "Wszyscy", selected: true })).toBeVisible();
    await expect(organiser.getByText(/Godziny w strefie/)).toHaveCount(0);
  });
});

test("a poll that does not exist says it is gone and links to a new one", async ({ page }, testInfo) => {
  await page.goto("/e/abcdefghij");

  await expect(page.getByRole("heading", { name: "Tej ankiety już nie ma" })).toBeVisible();
  await saveScreenshot(page, testInfo, "poll-gone");
  await page.getByRole("link", { name: "Zrób własną ankietę" }).click();

  await expect(page.getByRole("textbox", { name: "Co robimy?" })).toBeVisible();
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("creating, sending and Nie mogę work with no transition or animation", async ({ page }) => {
    await stubShareSheet(page);

    await page.addInitScript(() => {
      const moved: string[] = [];

      Object.defineProperty(window, "moved", { value: moved });
      for (const event of ["animationstart", "transitionrun"]) document.addEventListener(event, () => moved.push(event), true);
    });

    const moved = () => page.evaluate(() => (window as unknown as { moved: string[] }).moved);

    await page.goto("/");

    await createPoll(page, { title: "Kino", day: "Jutro", name: "Ola" });
    await expect(page).toHaveURL(/\/e\/[A-Za-z0-9_-]{10}$/);
    await inviteCard(page).getByRole("button", { name: "Wyślij na grupę" }).click();
    await expect(page.getByText("Wysłane. Odpowiedzi pojawią się tutaj.")).toBeVisible();

    const grid = page.getByRole("grid", { name: "Kiedy możesz?" });

    const cell = (hourIndex: number) =>
      grid
        .getByRole("row")
        .nth(hourIndex + 1)
        .getByRole("button")
        .nth(1);

    await cell(0).click();
    await cell(1).click();
    await expect(page.getByRole("status").filter({ hasText: "Zapisane" })).toBeVisible();
    await page.getByRole("button", { name: "Nie mogę w żadnym terminie" }).click();
    await expect(grid.getByRole("gridcell", { selected: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Cofnij" }).click();
    await expect(grid.getByRole("gridcell", { selected: true })).toHaveCount(2);

    expect(await moved()).toEqual([]);
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  });
});
