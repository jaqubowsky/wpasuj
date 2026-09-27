import { expect, test, type Page } from "@playwright/test";
import { settleAnimations } from "./screenshot";

const steps = [
  { label: "Na grupie cisza", heading: "Pytanie do wszystkich to pytanie do nikogo." },
  { label: "Tworzysz ankietę", heading: "Ankieta w trzy tapnięcia." },
  { label: "Wrzucasz link", heading: "Jeden link zamiast pytania." },
  { label: "Każdy klika godziny", heading: "Każdy klika swoje godziny." },
  { label: "Godziny się nagrzewają", heading: "Wspólne godziny robią się coraz cieplejsze." },
  { label: "Najlepszy termin", heading: "Najlepszy termin wyskakuje sam." },
  { label: "Ustalone", heading: "Ustalone. Prosto do kalendarza." },
];

const story = (page: Page) => page.getByRole("region", { name: "Jak to działa" });
const caption = (page: Page, heading: string) => story(page).getByRole("heading", { name: heading });
const shown = (page: Page, text: string) => story(page).getByText(text, { exact: true }).filter({ visible: true });

async function scrollThroughStory(page: Page, share: number) {
  await story(page).evaluate((section, share) => {
    const box = section.getBoundingClientRect();
    window.scrollTo(0, window.scrollY + box.top + (box.height - window.innerHeight) * share);
  }, share);
}

test("scrolling to each step lights its rail label and shows its caption", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "the story pins from 1280px");
  await page.goto("/");
  await story(page).scrollIntoViewIfNeeded();
  const rail = story(page).getByRole("list", { name: "Kroki" });

  for (const [index, step] of steps.entries()) {
    await scrollThroughStory(page, (index + 0.5) / steps.length);

    await expect(rail.locator('[aria-current="step"]')).toHaveText(step.label);
    await expect(caption(page, step.heading)).toBeVisible();
    for (const other of steps.filter((candidate) => candidate !== step)) {
      await expect(caption(page, other.heading)).toBeHidden();
    }
  }
});

test("the first scene is the group chat going silent", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "the story pins from 1280px");
  await page.goto("/");
  await story(page).scrollIntoViewIfNeeded();

  await scrollThroughStory(page, 0.02);

  await expect(story(page).getByText("Ej, planszówki w weekend? Kiedy możecie?").filter({ visible: true })).toBeVisible();
  await expect(story(page).getByText("Wyświetlone przez 5 osób").filter({ visible: true })).toBeVisible();
  await expect(caption(page, steps[0].heading)).toBeVisible();
  await settleAnimations(page);
  await page.screenshot({ path: `e2e/screenshots/landing-story-1-${testInfo.project.name}.png` });
});

test("at its step the link scene drops the preview and the reply into the chat, alone in the phone", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "the story pins from 1280px");
  await page.goto("/");
  await story(page).scrollIntoViewIfNeeded();

  await scrollThroughStory(page, 2.5 / steps.length);

  await expect(story(page).getByText("Kuba pyta, kiedy możesz")).toBeVisible();
  await expect(story(page).getByText("wpasuj.pl · pt 17 – nd 19 października")).toBeVisible();
  await expect(story(page).getByText("Zaznaczcie tu, zajmie wam to 20 sekund")).toBeVisible();
  await expect(story(page).getByText("Ej, planszówki w weekend? Kiedy możecie?").filter({ visible: true })).toHaveCount(1);
  await expect(caption(page, steps[2].heading)).toBeVisible();
  await settleAnimations(page);
  await page.screenshot({ path: `e2e/screenshots/landing-story-3-${testInfo.project.name}.png` });

  await scrollThroughStory(page, 0.5 / steps.length);

  await expect(story(page).getByText("Zaznaczcie tu, zajmie wam to 20 sekund")).toBeHidden();
});

test("the second scene fills in the create form and shows only at its step", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "the story pins from 1280px");
  await page.goto("/");
  await story(page).scrollIntoViewIfNeeded();

  await scrollThroughStory(page, 1.65 / steps.length);

  await expect(story(page).getByText("Planszówki u Michała").filter({ visible: true })).toBeVisible();
  await expect(story(page).getByText("Utwórz i wyślij na grupę")).toBeVisible();
  await expect(story(page).getByText("Ej, planszówki w weekend? Kiedy możecie?").filter({ visible: true })).toHaveCount(0);
  await expect(caption(page, steps[1].heading)).toBeVisible();
  await settleAnimations(page);
  await page.screenshot({ path: `e2e/screenshots/landing-story-2-${testInfo.project.name}.png` });

  await scrollThroughStory(page, 2.5 / steps.length);

  await expect(story(page).getByText("Utwórz i wyślij na grupę")).toBeHidden();
});

test("the fourth scene paints hours on the poll and shows only at its step", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "the story pins from 1280px");
  await page.goto("/");
  await story(page).scrollIntoViewIfNeeded();

  await scrollThroughStory(page, 3.6 / steps.length);

  await expect(story(page).getByText("Kuba pyta", { exact: true }).filter({ visible: true })).toHaveCount(1);
  await expect(story(page).getByText("Moje", { exact: true }).filter({ visible: true })).toHaveCount(1);
  await expect(story(page).getByText("Utwórz i wyślij na grupę")).toBeHidden();
  await expect(story(page).getByText("Ej, planszówki w weekend? Kiedy możecie?").filter({ visible: true })).toHaveCount(0);
  await expect(caption(page, steps[3].heading)).toBeVisible();
  await settleAnimations(page);
  await page.screenshot({ path: `e2e/screenshots/landing-story-4-${testInfo.project.name}.png` });

  await scrollThroughStory(page, 4.5 / steps.length);

  await expect(story(page).locator("[data-painted]").filter({ visible: true })).toHaveCount(0);
});

test("at its step the heat scene switches to everyone and warms the grid as friends join, alone in the phone", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "the story pins from 1280px");
  await page.goto("/");
  await story(page).scrollIntoViewIfNeeded();
  const avatar = (name: string) => story(page).getByRole("img", { name }).filter({ visible: true });

  await scrollThroughStory(page, 4.62 / steps.length);

  await expect(caption(page, steps[4].heading)).toBeVisible();
  await expect(story(page).getByText("Wszyscy", { exact: true }).filter({ visible: true })).toHaveCount(1);
  await expect(avatar("Bartek")).toBeVisible();
  await expect(avatar("Kasia")).toHaveCount(0);
  await settleAnimations(page);
  await page.screenshot({ path: `e2e/screenshots/landing-story-5-${testInfo.project.name}.png` });

  await scrollThroughStory(page, 3.5 / steps.length);
  await expect(avatar("Bartek")).toHaveCount(0);
});

test("at step 6 the best-time card rises over the heat, alone in the phone", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "the story pins from 1280px");
  await page.goto("/");
  await story(page).scrollIntoViewIfNeeded();

  await scrollThroughStory(page, 5.6 / steps.length);

  for (const text of ["Najlepiej", "Sobota 18.10, 19–22", "5 z 6 może", "Nie może: Ola", "Ustal ten termin"]) {
    await expect(shown(page, text)).toHaveCount(1);
  }
  await expect(story(page).locator("[data-chosen]").filter({ visible: true })).toHaveCount(0);
  await expect(story(page).getByText("Kuba pyta", { exact: true }).filter({ visible: true })).toHaveCount(1);
  await expect(caption(page, steps[5].heading)).toBeVisible();
  await settleAnimations(page);
  await page.screenshot({ path: `e2e/screenshots/landing-story-6-${testInfo.project.name}.png` });

  await scrollThroughStory(page, 4.5 / steps.length);

  await expect(shown(page, "Ustal ten termin")).toHaveCount(0);
});

test("at step 7 the time is settled, off to the calendar, alone in the phone", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "the story pins from 1280px");
  await page.goto("/");
  await story(page).scrollIntoViewIfNeeded();

  await scrollThroughStory(page, 6.6 / steps.length);

  for (const text of ["Sobota 18.10, 19–22", "Dodaj do kalendarza"]) {
    await expect(shown(page, text)).toHaveCount(1);
  }
  await expect(shown(page, "Ustalone")).toHaveCount(2);
  await expect(shown(page, "Najlepiej")).toHaveCount(0);
  await expect(shown(page, "Ustal ten termin")).toHaveCount(0);
  await expect(story(page).locator("[data-chosen]").filter({ visible: true })).toHaveCount(3);
  await expect(caption(page, steps[6].heading)).toBeVisible();
  await settleAnimations(page);
  await page.screenshot({ path: `e2e/screenshots/landing-story-7-${testInfo.project.name}.png` });

  await scrollThroughStory(page, 5.6 / steps.length);

  await expect(shown(page, "Dodaj do kalendarza")).toHaveCount(0);
});

async function backdropOf(page: Page) {
  const shot = await page.screenshot({ clip: { x: 8, y: 450, width: 1, height: 1 } });
  return page.evaluate(async (data) => {
    const image = new Image();
    image.src = `data:image/png;base64,${data}`;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const context = canvas.getContext("2d")!;
    context.drawImage(image, 0, 0);
    const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
    return `rgb(${red}, ${green}, ${blue})`;
  }, shot.toString("base64"));
}

test("the page warms while the hours heat up and the best time shows", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "the story pins from 1280px");
  await page.goto("/");
  await story(page).scrollIntoViewIfNeeded();

  for (const [index, step] of steps.entries()) {
    await scrollThroughStory(page, (index + 0.5) / steps.length);
    await expect(caption(page, step.heading)).toBeVisible();

    const warm = step.label === "Godziny się nagrzewają" || step.label === "Najlepszy termin";
    await expect.poll(() => backdropOf(page)).toBe(warm ? "rgb(253, 241, 234)" : "rgb(251, 247, 241)");
  }
});

test("below 1280px the story is a still sequence, since the caption column is too narrow to pin", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "a laptop width");
  await page.setViewportSize({ width: 1100, height: 768 });
  await page.goto("/#jak-to-dziala");

  for (const step of steps) {
    await caption(page, step.heading).scrollIntoViewIfNeeded();
    await expect(caption(page, step.heading)).toBeInViewport();
  }
  await expect(story(page).getByRole("list", { name: "Kroki" })).not.toBeAttached();
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("every caption shows and nothing pins", async ({ page }) => {
    await page.goto("/#jak-to-dziala");

    for (const step of steps) {
      await caption(page, step.heading).scrollIntoViewIfNeeded();
      await expect(caption(page, step.heading)).toBeVisible();
    }
    const pinned = await story(page).evaluate((section) =>
      [section, ...section.querySelectorAll("*")].filter((element) => getComputedStyle(element).position === "sticky").length,
    );
    expect(pinned).toBe(0);
  });
});

test("on the phone the story is a sequence of every step", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("phone"), "the sequence is the phone layout");
  await page.goto("/#jak-to-dziala");

  for (const step of steps) {
    await caption(page, step.heading).scrollIntoViewIfNeeded();
    await expect(caption(page, step.heading)).toBeInViewport();
  }
  await expect(story(page).getByText("Ej, planszówki w weekend? Kiedy możecie?").first()).toBeVisible();
  await expect(story(page).getByText("Zaznaczcie tu, zajmie wam to 20 sekund")).toBeVisible();
  await story(page).screenshot({ path: `e2e/screenshots/landing-story-${testInfo.project.name}.png` });
});

test("on the phone the create form shows filled in", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("phone"), "the sequence is the phone layout");
  await page.goto("/#jak-to-dziala");
  const stepTwo = story(page).locator(":scope > div").nth(1);

  await stepTwo.scrollIntoViewIfNeeded();

  await expect(stepTwo.getByText("Planszówki u Michała")).toBeVisible();
  await expect(stepTwo.getByText("Utwórz i wyślij na grupę")).toBeVisible();
  await stepTwo.screenshot({ path: `e2e/screenshots/landing-story-2-${testInfo.project.name}.png`, style: "header { visibility: hidden; }" });
});

test("on the phone the poll shows its seven painted hours", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("phone"), "the sequence is the phone layout");
  await page.goto("/#jak-to-dziala");
  const stepFour = story(page).locator(":scope > div").nth(3);

  await stepFour.scrollIntoViewIfNeeded();

  await expect(stepFour.getByText("Kuba pyta", { exact: true })).toBeVisible();
  await expect(stepFour.locator("[data-painted]")).toHaveCount(7);
  await stepFour.screenshot({ path: `e2e/screenshots/landing-story-4-${testInfo.project.name}.png`, style: "header { visibility: hidden; }" });
});

test("on the phone the heat scene shows everyone in and the grid at its warmest", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("phone"), "the sequence is the phone layout");
  await page.goto("/#jak-to-dziala");
  const stepFive = story(page).locator(":scope > div").nth(4);

  await stepFive.scrollIntoViewIfNeeded();

  for (const name of ["Kuba", "Ola", "Michał", "Zuza", "Bartek", "Kasia"]) {
    await expect(stepFive.getByRole("img", { name })).toBeVisible();
  }
  await expect(stepFive.getByText("Wszyscy", { exact: true })).toBeVisible();
  await settleAnimations(page);
  await stepFive.screenshot({ path: `e2e/screenshots/landing-story-5-${testInfo.project.name}.png`, style: "header { visibility: hidden; }" });
});

test("on the phone the best time shows risen, then settled", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("phone"), "the sequence is the phone layout");
  await page.goto("/#jak-to-dziala");
  const stepSix = story(page).locator(":scope > div").nth(5);
  const stepSeven = story(page).locator(":scope > div").nth(6);

  await stepSix.scrollIntoViewIfNeeded();
  await expect(stepSix.getByText("Ustal ten termin")).toBeVisible();
  await stepSix.screenshot({ path: `e2e/screenshots/landing-story-6-${testInfo.project.name}.png`, style: "header { visibility: hidden; }" });

  await stepSeven.scrollIntoViewIfNeeded();
  await expect(stepSeven.getByText("Dodaj do kalendarza")).toBeVisible();
  await expect(stepSeven.locator("[data-chosen]")).toHaveCount(3);
  await stepSeven.screenshot({ path: `e2e/screenshots/landing-story-7-${testInfo.project.name}.png`, style: "header { visibility: hidden; }" });
});
