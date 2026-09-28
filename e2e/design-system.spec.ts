import { expect, test, type Locator, type Page } from "@playwright/test";
import { saveScreenshot } from "./screenshot";
import { seedPoll } from "./seed";

const ink = "rgb(30, 27, 24)";

const styleOf = (locator: Locator) =>
  locator.evaluate((element) => {
    const style = getComputedStyle(element);
    return { fontFamily: style.fontFamily, fontSize: style.fontSize, fontWeight: style.fontWeight, boxShadow: style.boxShadow, transform: style.transform };
  });

async function expectTargetsAtLeast44(page: Page) {
  const targets = page.locator("button, [role=tab]");
  await expect(targets.first()).toBeVisible();
  for (const target of await targets.all()) {
    const box = await target.boundingBox();
    expect(box?.height, await target.evaluate((element) => element.outerHTML)).toBeGreaterThanOrEqual(44);
  }
}

async function expectSectionHeading(label: Locator) {
  expect(await styleOf(label)).toMatchObject({ fontFamily: expect.stringContaining("Bricolage"), fontSize: "18px", fontWeight: "700" });
}

test("the components page shows every component", async ({ page }, testInfo) => {
  await page.goto("/dev/components");

  await expect(page.getByRole("region", { name: "Status" })).toBeVisible();
  await saveScreenshot(page, testInfo, "components");
});

test("every button, chip and tab is at least 44px tall", async ({ page }) => {
  await page.goto("/dev/components");
  await expectTargetsAtLeast44(page);

  await page.goto("/");
  await page.getByRole("button", { name: "Własne" }).click();
  await expectTargetsAtLeast44(page);
});

test("the create form's questions are section headings and its steppers carry labels", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Własne" }).click();

  for (const question of ["Co robimy?", "Twoje imię"]) await expectSectionHeading(page.locator("label", { hasText: question }));
  for (const question of ["Kiedy?", "O której?"]) await expectSectionHeading(page.locator("legend", { hasText: question }));
  for (const stepper of ["od", "do"]) {
    expect(await styleOf(page.getByText(stepper, { exact: true }))).toMatchObject({ fontSize: "14px", fontWeight: "500" });
  }
  const titleSize = testInfo.project.name.startsWith("desktop") ? "40px" : "30px";
  expect(await styleOf(page.getByRole("textbox", { name: "Co robimy?" }))).toMatchObject({ fontSize: titleSize });
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

test("the answer's name question is a section heading", async ({ page }) => {
  const pollId = seedPoll({ dates: ["2030-10-19"], firstHour: 17, lastHour: 21 });

  await page.goto(`/e/${pollId}`);

  await expectSectionHeading(page.locator("label", { hasText: "Jak masz na imię?" }));
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

  test("a pressed button, chip or cell does not scale", async ({ page }) => {
    await page.goto("/dev/components");

    for (const target of [
      page.getByRole("button", { name: "Przypomnij" }),
      page.getByRole("button", { name: "Dziś" }),
      page.getByRole("button", { name: "wolne" }),
    ]) {
      await target.hover();
      await page.mouse.down();
      expect((await styleOf(target)).transform).toBe("none");
      await page.mouse.up();
    }
  });
});
