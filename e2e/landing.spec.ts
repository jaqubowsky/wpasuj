import { expect, test, type Page } from "@playwright/test";
import { centreOf, mouseDrag, touchDrag } from "./pointer";
import { saveScreenshot } from "./screenshot";

const titleField = (page: Page) => page.getByRole("textbox", { name: "Co robimy?" });
const finalCall = (page: Page) => page.getByRole("region", { name: "To kiedy się widzicie?" });
const demo = (page: Page) => page.getByRole("region", { name: "Wypróbuj na żywo" });
const demoCell = (page: Page, name: string) => demo(page).getByRole("button", { name: new RegExp(`^${name}, \\d z 5 może$`) });

test("the create form is in the first viewport and creates a poll", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { configurable: true, value: async () => {} });
  });
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: "Kiedy się widzimy? Ustalcie to w minutę." })).toBeInViewport();
  await expect(titleField(page)).toBeInViewport();

  await titleField(page).fill("Kino w piątek");
  await page.getByRole("button", { name: "Przyszły tydzień" }).click();
  await page.getByRole("textbox", { name: "Twoje imię" }).fill("Ola");
  await page.getByRole("button", { name: "Utwórz i wyślij na grupę" }).click();

  await expect(page).toHaveURL(/\/e\/[A-Za-z0-9_-]{10}$/);
  await expect(page.getByRole("heading", { name: "Kino w piątek" })).toBeVisible();
});

test("the final call scrolls to the form and focuses its first field", async ({ page }) => {
  await page.goto("/");
  await finalCall(page).scrollIntoViewIfNeeded();

  await finalCall(page).getByRole("button", { name: "Utwórz ankietę" }).click();

  await expect(titleField(page)).toBeFocused();
  await expect(titleField(page)).toBeInViewport();
});

test("the header button scrolls to the form and focuses its first field", async ({ page }) => {
  await page.goto("/");
  await finalCall(page).scrollIntoViewIfNeeded();

  await page.getByRole("banner").getByRole("button", { name: "Utwórz ankietę" }).click();

  await expect(titleField(page)).toBeFocused();
  await expect(titleField(page)).toBeInViewport();
});

test("the story and the demo load after the form is interactive", async ({ page, request }) => {
  const html = await (await request.get("/")).text();
  const initialChunks = new Set([...html.matchAll(/\/_next\/static\/chunks\/[^"'\s]+\.js/g)].map((match) => match[0]));
  const lateChunks: string[] = [];
  let releaseLateChunks!: () => void;
  const lateChunksReleased = new Promise<void>((resolve) => (releaseLateChunks = resolve));
  await page.route("**/_next/static/chunks/**/*.js", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (!initialChunks.has(path)) {
      lateChunks.push(path);
      await lateChunksReleased;
    }
    await route.continue();
  });

  await page.goto("/");
  await titleField(page).fill("Planszówki");
  await page.getByRole("button", { name: "Dziś", exact: true }).click();
  await expect(page.getByRole("button", { name: "Dziś", pressed: true })).toBeVisible();
  releaseLateChunks();
  await finalCall(page).scrollIntoViewIfNeeded();

  await expect(page.getByRole("region", { name: "Jak to działa" })).toBeAttached();
  await expect(page.getByRole("region", { name: "Wypróbuj na żywo" })).toBeAttached();
  expect(lateChunks.length).toBeGreaterThan(0);
});

test("the demo's best time follows a tap and a drag", async ({ page, browserName, isMobile }, testInfo) => {
  await page.goto("/");
  await demo(page).scrollIntoViewIfNeeded();
  const bestTime = demo(page).getByRole("status", { name: "Najlepiej" });
  await expect(bestTime).toContainText("Sobota 18.10, 19–21");
  await expect(bestTime).toContainText("4 z 5 może");
  await expect(bestTime).toContainText("Nie może: Ty");

  const saturday19 = demoCell(page, "sb 18, 19:00");
  if (isMobile) await saturday19.tap();
  else await saturday19.click();

  await expect(bestTime).toContainText("Sobota 18.10, 19–20");
  await expect(bestTime).toContainText("5 z 5 może");
  await expect(bestTime).toContainText("Wszyscy mogą");

  await demo(page).getByRole("button", { name: "Wyczyść moje godziny" }).click();
  await expect(bestTime).toContainText("Nie może: Ty");
  const drag = browserName === "chromium" && isMobile ? touchDrag : mouseDrag;
  await demoCell(page, "pt 17, 19:00").scrollIntoViewIfNeeded();
  await drag(page, await centreOf(demoCell(page, "pt 17, 19:00")), await centreOf(demoCell(page, "pt 17, 20:00")));

  await expect(demo(page).getByRole("gridcell", { selected: true })).toHaveCount(2);
  await expect(bestTime).toContainText("Piątek 17.10, 20–21");
  await expect(bestTime).toContainText("5 z 5 może");
  await expect(demo(page).getByRole("list", { name: "Też dobre" })).toContainText("sb 18.10, 19–214 z 5");
  await demo(page).screenshot({ path: `e2e/screenshots/landing-demo-painted-${testInfo.project.name}.png` });
});

test("the demo's call scrolls to the form and focuses its first field", async ({ page }) => {
  await page.goto("/");
  await demo(page).scrollIntoViewIfNeeded();

  await demo(page).getByRole("button", { name: "Zrób taką ankietę dla swojej paczki" }).click();

  await expect(titleField(page)).toBeFocused();
  await expect(titleField(page)).toBeInViewport();
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("nothing animates and nothing is moved", async ({ page }, testInfo) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Zrobione pod paczkę znajomych, nie pod firmę." })).toBeAttached();

    for (const y of [0.25, 0.5, 0.75, 1]) {
      await page.evaluate((share) => window.scrollTo(0, document.documentElement.scrollHeight * share), y);
      expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
    }
    const moved = await page.evaluate(() =>
      [...document.querySelectorAll("body *")].filter((element) => getComputedStyle(element).transform !== "none").length,
    );
    expect(moved).toBe(0);

    await saveScreenshot(page, testInfo, "landing");
    for (const [name, section] of [
      ["hero", page.getByRole("region", { name: "Kiedy się widzimy? Ustalcie to w minutę." })],
      ["demo", demo(page)],
      ["reasons", page.getByRole("region", { name: "Zrobione pod paczkę znajomych, nie pod firmę." })],
      ["final-call", finalCall(page)],
    ] as const) {
      await section.screenshot({ path: `e2e/screenshots/landing-${name}-${testInfo.project.name}.png` });
    }
  });
});

test("reveals follow the scroll where motion is allowed", async ({ page }) => {
  await page.goto("/");
  test.skip(!(await page.evaluate(() => CSS.supports("animation-timeline: view()"))), "no scroll-driven animations");

  await page.getByRole("heading", { name: "Zrobione pod paczkę znajomych, nie pod firmę." }).scrollIntoViewIfNeeded();

  expect(await page.evaluate(() => document.getAnimations().length)).toBeGreaterThan(0);
});
