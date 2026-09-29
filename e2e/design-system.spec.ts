import type { Locator, Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { saveScreenshot } from "./screenshot";
import { seedAnswer, seedPoll } from "./seed";

const ink = "rgb(30, 27, 24)";

const styleOf = (locator: Locator) =>
  locator.evaluate((element) => {
    const style = getComputedStyle(element);

    return {
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      boxShadow: style.boxShadow,
      transform: style.transform,
      translate: style.translate,
    };
  });

async function expectTargetsAtLeast44(page: Page) {
  await expect(page.locator("button:visible, [role=tab]:visible").first()).toBeVisible();

  const tooSmall = await page.evaluate(() =>
    [...document.querySelectorAll("button, [role=tab]")]
      .filter((element) => element.checkVisibility({ visibilityProperty: true }))
      .map((element) => ({ box: element.getBoundingClientRect(), html: element.outerHTML }))
      .filter(({ box }) => box.width > 0 && box.height > 0 && (box.width < 44 || box.height < 44))
      .map(({ box, html }) => `${Math.round(box.width)}×${Math.round(box.height)} ${html}`),
  );

  expect(tooSmall).toEqual([]);
}

async function expectSectionHeading(label: Locator) {
  expect(await styleOf(label)).toMatchObject({ fontFamily: expect.stringContaining("Bricolage"), fontSize: "18px", fontWeight: "700" });
}

test("the components page shows every component", async ({ page }, testInfo) => {
  await page.goto("/dev/components");

  await expect(page.getByRole("region", { name: "Status" })).toBeVisible();
  await saveScreenshot(page, testInfo, "components");
});

test("every button, chip and tab is at least 44px tall and wide", async ({ page }, testInfo) => {
  await page.goto("/dev/components");
  await expectTargetsAtLeast44(page);

  await page.goto("/");
  await expectTargetsAtLeast44(page);

  if (testInfo.project.name.startsWith("phone")) {
    await page.getByRole("button", { name: "Od 17:00" }).click();
    await expectTargetsAtLeast44(page);
  }
});

test("every target on the poll page is at least 44px tall and wide", async ({ browser }, testInfo) => {
  const organiserToken = "organiser-token-for-the-44px-sweep-0123456";
  const pollId = seedPoll({ dates: ["2031-10-17", "2031-10-18", "2031-10-19"], firstHour: 18, hourCount: 4, organiserToken });

  const kuba = seedAnswer(pollId, "Kuba", Date.now() - 60_000, [
    ["2031-10-17", 19],
    ["2031-10-18", 19],
  ]);

  seedAnswer(pollId, "Ola", Date.now() - 30_000, [["2031-10-18", 19]]);
  const context = await browser.newContext(testInfo.project.use);

  await context.addCookies([
    { name: pollId, value: kuba, url: "http://localhost:3000" },
    { name: `${pollId}-org`, value: organiserToken, url: "http://localhost:3000" },
  ]);

  const page = await context.newPage();

  await page.goto(`/e/${pollId}`);

  await expectTargetsAtLeast44(page);
  await page.getByRole("button", { name: "sb 18, 19:00, 2 z 2 może" }).click();
  await expectTargetsAtLeast44(page);
  await page.keyboard.press("Escape");
  await page.getByRole("tab", { name: "Moje" }).click();
  await expectTargetsAtLeast44(page);

  const newcomer = await browser.newPage(testInfo.project.use);

  await newcomer.goto(`/e/${pollId}`);
  await newcomer.getByRole("textbox", { name: "Twoje imię" }).fill("Ola");
  await newcomer.getByRole("grid", { name: "Kiedy możesz?" }).getByRole("row").nth(1).getByRole("button").nth(1).click();
  await expect(newcomer.getByRole("button", { name: "Tak, to ja" })).toBeVisible();
  await expectTargetsAtLeast44(newcomer);
});

const ledgeOf = (locator: Locator) =>
  locator.evaluate((element) => {
    const ledge = getComputedStyle(element)
      .boxShadow.split(/,(?![^(]*\))/)
      .map((shadow) => shadow.trim())
      .find((shadow) => !shadow.endsWith("inset") && !shadow.endsWith(" 0px 0px 0px 0px"));

    if (!ledge) return "none";

    const [, color, geometry] = /^(.*\)) (.*)$/.exec(ledge)!;
    const canvas = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;

    canvas.fillStyle = color;
    canvas.fillRect(0, 0, 1, 1);
    const [red, green, blue] = canvas.getImageData(0, 0, 1, 1).data;

    return `rgb(${red}, ${green}, ${blue}) ${geometry}`;
  });

test("every button and chip stands on a ledge, and a press drops it onto the ledge", async ({ page }, testInfo) => {
  const heat5 = "rgb(204, 68, 32)";
  const accent = "rgb(240, 96, 63)";
  const edge = "rgb(149, 138, 126)";

  await page.goto("/dev/components");

  const buttons = page.getByRole("region", { name: "Button" });
  const chips = page.getByRole("region", { name: "Chip" });

  for (const [target, ledge] of [
    [buttons.getByRole("button", { name: "Utwórz i wyślij na grupę" }), `${heat5} 0px 8px 0px -1px`],
    [buttons.getByRole("button", { name: "Przypomnij" }), `${ink} 0px 8px 0px -1px`],
    [buttons.getByRole("button", { name: "Więcej" }), `${ink} 0px 5px 0px -1px`],
    [buttons.getByRole("button", { name: "Utwórz ankietę" }).first(), `${heat5} 0px 8px 0px -1px`],
    [buttons.getByRole("button", { name: "Utwórz ankietę" }).last(), `${accent} 0px 8px 0px -1px`],
    [buttons.getByRole("button", { name: "Ustal ten termin" }), `${accent} 0px 8px 0px -1px`],
    [buttons.getByRole("button", { name: "Nie mogę w żadnym terminie" }), "none"],
    [chips.getByRole("button", { name: "Dziś" }), `${edge} 0px 5px 0px -1px`],
    [chips.getByRole("button", { name: "Ten weekend" }), `${heat5} 0px 5px 0px -1px`],
  ] as const) {
    expect(await ledgeOf(target)).toBe(ledge);
  }

  const pressed = buttons.getByRole("button", { name: "Przypomnij" });

  await pressed.hover();
  await page.mouse.down();
  await expect(pressed).toHaveCSS("translate", "0px 6px");
  await expect.poll(() => ledgeOf(pressed)).toBe(`${ink} 0px 2px 0px -1px`);
  await saveScreenshot(page, testInfo, "components-button-pressed");
  await page.mouse.up();

  const small = buttons.getByRole("button", { name: "Więcej" });

  await small.hover();
  if (testInfo.project.name.startsWith("desktop")) await expect.poll(() => ledgeOf(small)).toBe(`${ink} 0px 7px 0px -1px`);

  await page.mouse.down();
  await expect(small).toHaveCSS("translate", "0px 4px");
  await expect.poll(() => ledgeOf(small)).toBe(`${ink} 0px 1px 0px -1px`);
  await page.mouse.up();
});

const backdropOf = (tab: Locator) =>
  tab.evaluate((element) => {
    const { x, y, width, height } = element.getBoundingClientRect();
    const beneath = document.elementsFromPoint(x + width / 2, y + height / 2);

    return beneath.map((layer) => getComputedStyle(layer).backgroundColor).find((color) => color !== "rgba(0, 0, 0, 0)");
  });

test("the ink pill slides under the selected Segment tab", async ({ page }) => {
  await page.goto("/dev/components");
  const segment = page.getByRole("region", { name: "Segment" });

  for (const [picked, other] of [
    ["Wszyscy", "Moje"],
    ["Moje", "Wszyscy"],
  ] as const) {
    await segment.getByRole("tab", { name: picked }).click();

    await expect.poll(() => backdropOf(segment.getByRole("tab", { name: picked }))).toBe(ink);
    await expect.poll(() => backdropOf(segment.getByRole("tab", { name: other }))).not.toBe(ink);
  }
});

test("Segment tabs ask for an Onest weight the app loads", async ({ page }) => {
  await page.goto("/dev/components");

  await expect(page.getByRole("region", { name: "Segment" }).getByRole("tab", { name: "Moje" })).toHaveCSS("font-weight", "600");
});

test("Button, Chip and Segment show the ink focus ring from the keyboard", async ({ page }, testInfo) => {
  await page.goto("/dev/components");

  for (const [part, target] of [
    ["button", page.getByRole("region", { name: "Button" }).getByRole("button", { name: "Przypomnij" })],
    ["chip", page.getByRole("region", { name: "Chip" }).getByRole("button", { name: "Dziś" })],
    ["segment", page.getByRole("region", { name: "Segment" }).getByRole("tab", { selected: true })],
  ] as const) {
    await target.focus();

    await expect(target).toHaveCSS("outline-style", "solid");
    await expect(target).toHaveCSS("outline-width", "2px");
    await expect(target).toHaveCSS("outline-color", ink);
    const box = (await target.boundingBox())!;

    await page.screenshot({
      path: `e2e/screenshots/components-focus-${part}-${testInfo.project.name}.png`,
      clip: { x: box.x - 8, y: box.y - 8, width: box.width + 16, height: box.height + 16 },
    });
  }
});

test("the create form's title is its headline and its questions are section headings", async ({ page }, testInfo) => {
  await page.goto("/");

  await expectSectionHeading(page.locator("label", { hasText: "Twoje imię" }));
  for (const question of ["Kiedy?", "O której?"]) await expectSectionHeading(page.locator("legend", { hasText: question }));
  const titleSize = testInfo.project.name.startsWith("desktop") ? "96px" : "48px";

  expect(await styleOf(page.getByRole("textbox", { name: "Co robimy?" }))).toMatchObject({ fontSize: titleSize, fontWeight: "800" });
});

test("a long title wraps onto more lines instead of scrolling", async ({ page }) => {
  await page.goto("/");
  const title = page.getByRole("textbox", { name: "Co robimy?" });

  await title.fill("Grill");
  const oneLine = (await title.boundingBox())!.height;

  await title.fill("Grill na działce u Oli i Marka w sobotę");

  expect((await title.boundingBox())!.height).toBeGreaterThan(oneLine * 1.5);
});

test("day numbers are tracked tight", async ({ page }) => {
  await page.goto("/dev/components");

  const dayNumber = page.getByRole("region", { name: "Text" }).getByText("17", { exact: true });
  const stepperValue = page.getByRole("group", { name: "od" }).first().getByRole("status");

  for (const number of [dayNumber, stepperValue]) {
    expect(await number.evaluate((element) => getComputedStyle(element).letterSpacing)).toBe("-0.4px");
  }
});

test("a cell reached by keyboard shows its focus ring", async ({ page }, testInfo) => {
  await page.goto("/dev/components");

  const cell = page.getByRole("button", { name: "wolne" });

  await cell.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");

  await expect(cell).toBeFocused();
  expect((await styleOf(cell)).boxShadow).toContain(ink);
  await saveScreenshot(page, testInfo, "components-cell-focus");
});

test("the answer's name label is small, with the save state beside it", async ({ page }) => {
  const pollId = seedPoll({ dates: ["2030-10-19"], firstHour: 17, hourCount: 4 });

  await page.goto(`/e/${pollId}`);

  const label = page.locator("label", { hasText: "Twoje imię" });

  await expect(label).toHaveCSS("font-size", "14px");
  await expect(label).toHaveCSS("font-weight", "600");
});

test("an invalid input shows the focus ring while focused", async ({ page }, testInfo) => {
  await page.goto("/dev/components");

  for (const name of ["Imię z błędem", "Tytuł z błędem"]) {
    const input = page.getByRole("textbox", { name });

    await input.focus();
    expect((await styleOf(input)).boxShadow).toContain(ink);
  }

  await page.getByRole("textbox", { name: "Imię z błędem" }).focus();
  await saveScreenshot(page, testInfo, "components-invalid-focus");
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("a pressed button, chip or cell does not move", async ({ page }) => {
    await page.goto("/dev/components");

    for (const target of [
      page.getByRole("button", { name: "Przypomnij" }),
      page.getByRole("button", { name: "Dziś" }),
      page.getByRole("button", { name: "wolne" }),
    ]) {
      await target.hover();
      await page.mouse.down();
      expect(await styleOf(target)).toMatchObject({ transform: "none", translate: "none" });
      await page.mouse.up();
    }
  });
});
