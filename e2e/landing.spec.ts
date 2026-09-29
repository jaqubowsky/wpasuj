import { expect, test, type Locator, type Page } from "@playwright/test";
import { saveScreenshot } from "./screenshot";

const titleField = (page: Page) => page.getByRole("textbox", { name: "Co robimy?" });
const hero = (page: Page) => page.getByRole("region", { name: "Kiedy się widzimy na grillu?" });
const heroPosters = (page: Page) => page.locator("[data-hero-poster]");
const quote = (page: Page) => page.getByRole("region", { name: "„A może w piątek?”" });
const tryIt = (page: Page) => page.getByRole("region", { name: "Kliknij, kiedy możesz" });
const wall = (page: Page) => page.getByRole("region", { name: "Na grill, na urodziny, na wszystko" });
const make = (page: Page) => page.getByRole("region", { name: "Twoja kolej" });
const faq = (page: Page) => page.getByRole("region", { name: "Pytania" });
const outro = (page: Page) => page.getByRole("region", { name: "To kiedy się widzimy?" });

const wallPlayStates = (page: Page) =>
  page
    .locator("[data-wall-lane]")
    .evaluateAll((lanes) => lanes.flatMap((lane) => lane.getAnimations().map((animation) => animation.playState)));

const horizontalShift = (poster: Locator) => poster.evaluate((element) => parseFloat(getComputedStyle(element).translate) || 0);

test("the first screen asks the question and offers the poll", async ({ page }, testInfo) => {
  await page.goto("/");

  await expect(hero(page).getByRole("heading", { level: 1, name: "Kiedy się widzimy na grillu?" })).toBeInViewport();
  await expect(hero(page).getByText("Wrzucasz jeden link na grupę")).toBeInViewport();
  await expect(hero(page).getByRole("button", { name: "Utwórz ankietę" })).toBeInViewport();
  await page.screenshot({ path: `e2e/screenshots/landing-first-screen-${testInfo.project.name}.png` });
});

test("the hero's call scrolls to the form, focuses its first field and the form creates a poll", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { configurable: true, value: async () => {} });
  });

  await page.goto("/");
  await hero(page).getByRole("button", { name: "Utwórz ankietę" }).click();

  await expect(titleField(page)).toBeFocused();
  await expect(titleField(page)).toBeInViewport();

  await titleField(page).fill("Kino w piątek");
  await page.getByRole("button", { name: "Przyszły tydzień" }).click();
  await page.getByRole("textbox", { name: "Twoje imię" }).fill("Ola");
  await page.getByRole("button", { name: "Utwórz i wyślij na grupę" }).click();

  await expect(page).toHaveURL(/\/e\/[A-Za-z0-9_-]{10}$/);
  await expect(page.getByRole("heading", { name: "Kino w piątek" })).toBeVisible();
});

test("the sections follow the owner's order", async ({ page }) => {
  await page.goto("/");

  const order = await page
    .locator("main section[aria-labelledby]")
    .evaluateAll((sections) => sections.map((section) => section.getAttribute("aria-labelledby")));

  expect(order).toEqual(["hero-heading", "quote-heading", "try-heading", "wall-heading", "form-heading", "faq-heading", "end-heading"]);
});

test("the header button and the outro's call scroll to the form and focus its first field", async ({ page }) => {
  await page.goto("/");
  await outro(page).scrollIntoViewIfNeeded();

  await page.getByRole("banner").getByRole("button", { name: "Utwórz ankietę" }).click();

  await expect(titleField(page)).toBeFocused();
  await expect(titleField(page)).toBeInViewport();

  await outro(page).scrollIntoViewIfNeeded();
  await outro(page).getByRole("button", { name: "Utwórz ankietę" }).click();

  await expect(titleField(page)).toBeFocused();
  await expect(titleField(page)).toBeInViewport();
});

test("the logo takes the reader back to the top", async ({ page }) => {
  await page.goto("/");
  await faq(page).scrollIntoViewIfNeeded();

  await page.getByRole("link", { name: "Wpasuj, na górę strony" }).click();

  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

test("the headline's word swaps once through the list and stops on grillu", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  const word = hero(page).getByRole("heading", { level: 1 }).locator("[aria-hidden]");

  await expect(word).toHaveText("grillu?");

  for (const next of ["planszówkach?", "urodzinach?", "kinie?", "Orliku?", "grillu?"]) {
    await page.clock.runFor(3200);
    await expect(word).toHaveText(next);
  }

  await page.clock.runFor(10_000);
  await expect(word).toHaveText("grillu?");
});

test("the hero's posters follow the pointer and drift", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "a phone has no pointer to follow");
  const viewport = page.viewportSize()!;

  await page.goto("/");
  await page.mouse.move(0, viewport.height / 2);
  await expect.poll(() => horizontalShift(heroPosters(page).first())).toBeLessThan(-3);

  await page.mouse.move(viewport.width - 1, viewport.height / 2);
  await expect.poll(() => horizontalShift(heroPosters(page).first())).toBeGreaterThan(3);

  expect(
    await heroPosters(page)
      .first()
      .evaluate((poster) => poster.getAnimations({ subtree: true }).length),
  ).toBeGreaterThan(0);
});

test("every hero poster sits inside the screen, clear of the headline and the call", async ({ page }) => {
  const viewport = page.viewportSize()!;

  await page.goto("/");
  const headline = (await hero(page).getByRole("heading", { level: 1 }).boundingBox())!;
  const call = (await hero(page).getByRole("button", { name: "Utwórz ankietę" }).boundingBox())!;

  const overlaps = (a: typeof headline, b: typeof headline) =>
    a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

  for (const poster of await heroPosters(page).filter({ visible: true }).all()) {
    const box = (await poster.boundingBox())!;

    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
    expect(overlaps(box, headline)).toBe(false);
    expect(overlaps(box, call)).toBe(false);
  }
});

test("no poster clips its own content", async ({ page }) => {
  await page.goto("/");

  const clipped = await page
    .locator("[data-poster-card]")
    .evaluateAll((posters) =>
      posters
        .filter((poster) => poster.scrollHeight > poster.clientHeight || poster.scrollWidth > poster.clientWidth)
        .map((poster) => poster.getAttribute("aria-label")),
    );

  expect(clipped).toEqual([]);
});

test("a poster flips to its settled time", async ({ page }) => {
  await page.goto("/");
  const poster = hero(page).getByRole("button", { name: "Grill u Oli, sb 3.10" });

  await poster.click({ force: true });

  await expect(poster).toHaveAttribute("aria-pressed", "true");
  await expect(poster.getByText("Ustalone")).toBeVisible();
});

test("the quote counts to 47 messages, then the link arrives", async ({ page }) => {
  await page.goto("/");
  await quote(page).scrollIntoViewIfNeeded();

  await expect(quote(page).getByText("wiadomości później")).toHaveText("4747 wiadomości później");
  await expect(quote(page).getByRole("figure", { name: "Grill na działce u Oli" })).toBeVisible();
  await expect(quote(page).locator("[data-seen]")).toHaveCSS("opacity", "1");
});

test("a tap on the try-it poll moves the best time", async ({ page }) => {
  await page.goto("/");
  const best = tryIt(page).getByRole("status");

  await tryIt(page).scrollIntoViewIfNeeded();
  await expect(best).toContainText("Sobota, 20:00");
  await expect(best).toContainText("4 z 6");

  await tryIt(page).getByRole("button", { name: "Sobota, 21:00, 4 z 6" }).click();

  await expect(best).toContainText("Sobota, 21:00");
  await expect(best).toContainText("5 z 6");
});

test("the wall of posters runs and pauses under the pointer", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "a phone has no hover");
  await page.goto("/");
  await wall(page).scrollIntoViewIfNeeded();

  expect(await wallPlayStates(page)).toEqual(["running", "running"]);

  await wall(page).getByRole("button", { name: "Kino, czw 9, 19:30" }).first().hover({ force: true });

  expect(await wallPlayStates(page)).toEqual(["paused", "paused"]);
});

test("the link preview beside the form follows what the organiser types", async ({ page }) => {
  await page.goto("/");
  await expect(make(page).getByRole("figure", { name: "Wasz plan" })).toContainText("Ty pytasz, kiedy możesz");

  await titleField(page).fill("Grill u Oli");
  await page.getByRole("textbox", { name: "Twoje imię" }).fill("Kuba");

  await expect(make(page).getByRole("figure", { name: "Grill u Oli" })).toContainText("Kuba pyta, kiedy możesz");
});

test("stopping the motion holds every idle loop and is remembered", async ({ page }) => {
  const idleStates = () =>
    page
      .locator("[data-idle-motion]")
      .evaluateAll((loops) => loops.flatMap((loop) => loop.getAnimations().map((animation) => animation.playState)));

  await page.goto("/");
  expect(await idleStates()).toContain("running");

  await page.getByRole("button", { name: "Zatrzymaj ruch" }).click();

  await expect(page.getByRole("button", { name: "Włącz ruch" })).toBeVisible();
  expect(new Set(await idleStates())).toEqual(new Set(["paused"]));

  await page.reload();

  await expect(page.getByRole("button", { name: "Włącz ruch" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "still");
});

test("with the motion stopped the phone's hour sheet still slides into view", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("phone"), "the hour sheet is a phone layout");
  await page.goto("/");
  await page.getByRole("button", { name: "Zatrzymaj ruch" }).click();

  await page.getByRole("button", { name: "Od 17:00" }).click();

  await expect(page.locator("[data-create-hour-sheet]")).toHaveCSS("transform", "none");
});

test("on the phone the create bar stays whole as it leaves with the form", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("phone"), "the bar sticks only on the phone");
  const createButton = page.getByRole("button", { name: "Utwórz i wyślij na grupę" });

  await page.goto("/");

  await page.locator("form").evaluate((form) => window.scrollBy(0, form.getBoundingClientRect().bottom - (window.innerHeight - 30)));

  await expect(createButton).toBeInViewport({ ratio: 1 });
  await faq(page).scrollIntoViewIfNeeded();
  const questions = (await faq(page).boundingBox())!;
  const button = (await createButton.boundingBox())!;

  expect(button.y + button.height).toBeLessThanOrEqual(questions.y);
});

const questions = [
  "Czy znajomi muszą coś instalować albo zakładać konto?",
  "A jak ktoś otworzy link na innym telefonie?",
  "Ile to kosztuje?",
  "Co się dzieje z danymi?",
];

const answerOf = (page: Page, question: string) => faq(page).locator("details", { hasText: question }).locator("p");

test.describe("on a touch screen", () => {
  test.use({ hasTouch: true });

  test("each question opens with a tap", async ({ page }) => {
    await page.goto("/");
    await faq(page).scrollIntoViewIfNeeded();

    for (const question of questions) {
      await expect(answerOf(page, question)).toBeHidden();
      await faq(page).getByText(question, { exact: true }).tap();
      await expect(answerOf(page, question)).toBeVisible();
    }
  });
});

test("each question opens with the keyboard", async ({ page }) => {
  await page.goto("/");
  await faq(page).locator("summary", { hasText: questions[0] }).focus();

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

  test("nothing moves, the counted and lit states show at once, and no toggle is offered", async ({ page }, testInfo) => {
    const viewport = page.viewportSize()!;

    await page.goto("/");
    await page.mouse.move(0, 0);
    await page.mouse.move(viewport.width - 1, viewport.height - 1);

    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);

    expect(await heroPosters(page).evaluateAll((all) => all.filter((poster) => getComputedStyle(poster).translate !== "none").length)).toBe(
      0,
    );

    await expect(page.getByRole("button", { name: "Zatrzymaj ruch" })).toBeHidden();
    await expect(quote(page).getByText("wiadomości później")).toHaveText("4747 wiadomości później");
    await expect(outro(page).getByRole("img", { name: "Wpasuj" })).toHaveAttribute("data-lit");

    await saveScreenshot(page, testInfo, "landing");

    for (const [name, section] of [
      ["hero", hero(page)],
      ["quote", quote(page)],
      ["try", tryIt(page)],
      ["wall", wall(page)],
      ["make", make(page)],
      ["faq", faq(page)],
      ["outro", outro(page)],
    ] as const) {
      await section.evaluate((element) => element.scrollIntoView({ block: "start" }));
      await page.screenshot({ path: `e2e/screenshots/landing-${name}-${testInfo.project.name}.png` });
    }
  });
});
