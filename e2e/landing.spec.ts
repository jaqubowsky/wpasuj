import { expect, test, type Page } from "@playwright/test";
import { saveScreenshot } from "./screenshot";

const titleField = (page: Page) => page.getByRole("textbox", { name: "Co robimy?" });
const finalCall = (page: Page) => page.getByRole("region", { name: "To kiedy się widzicie?" });

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

const questions = [
  "Czy znajomi muszą coś instalować albo zakładać konto?",
  "A jak ktoś otworzy link na innym telefonie?",
  "Ile to kosztuje?",
  "Co się dzieje z danymi?",
];
const faq = (page: Page) => page.getByRole("region", { name: "Pytania" });
const answerOf = (page: Page, question: string) => faq(page).locator("details", { hasText: question }).locator("p");

test.describe("on a touch screen", () => {
  test.use({ hasTouch: true });

  test("each question opens with a tap", async ({ page }) => {
    await page.goto("/");
    await faq(page).scrollIntoViewIfNeeded();
    await expect(page.getByRole("region", { name: "Jak to działa" })).toBeAttached();
    await expect(page.getByRole("region", { name: "Wypróbuj na żywo" })).toBeAttached();

    for (const question of questions) {
      await expect(answerOf(page, question)).toBeHidden();
      await faq(page).getByText(question, { exact: true }).tap();
      await expect(answerOf(page, question)).toBeVisible();
    }
  });
});

test("each question opens with the keyboard", async ({ page }) => {
  await page.goto("/");
  await faq(page).getByText(questions[0], { exact: true }).focus();

  for (const question of questions) {
    await expect(answerOf(page, question)).toBeHidden();
    await page.keyboard.press("Enter");
    await expect(answerOf(page, question)).toBeVisible();
    await page.keyboard.press("Tab");
  }
});

test("the footer names the product and links nowhere", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("contentinfo")).toHaveText("Wpasuj, darmowe ankiety terminów dla znajomych");
  await expect(page.getByRole("contentinfo").getByRole("link")).toHaveCount(0);
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
      ["reasons", page.getByRole("region", { name: "Zrobione pod paczkę znajomych, nie pod firmę." })],
      ["final-call", finalCall(page)],
      ["faq", faq(page)],
      ["footer", page.getByRole("contentinfo")],
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
