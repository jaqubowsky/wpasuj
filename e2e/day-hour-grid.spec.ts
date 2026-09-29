import { expect, test, type Page } from "@playwright/test";
import { centreOf, dispatchedTouchDrag, mouseDrag, touchDrag, touchHoldDrag } from "./pointer";
import { saveScreenshot } from "./screenshot";

function cell(page: Page, name: string) {
  return page.getByRole("button", { name, exact: true });
}

test.describe("day-hour grid", () => {
  for (const count of [3, 7]) {
    test(`shows ${count} dates as 48px tiles with a 6px gap`, async ({ page }, testInfo) => {
      await page.goto(`/dev/day-hour-grid?dates=${count}`);

      const grid = page.getByRole("grid", { name: "Kiedy możesz?" });

      await expect(page.getByRole("columnheader")).toHaveCount(count);
      await expect(grid).toHaveCSS("column-gap", "6px");
      await expect(grid).toHaveCSS("row-gap", "6px");
      const tile = cell(page, "pt 16, 19:00");

      await expect(tile).toHaveCSS("height", "48px");
      await expect(tile).toHaveCSS("border-radius", "10px");
      const width = await tile.evaluate((element) => element.getBoundingClientRect().width);

      expect(width).toBeGreaterThanOrEqual(56);
      await saveScreenshot(page, testInfo, `day-hour-grid-${count}-dates`);
    });
  }

  test("sets touch-action manipulation on cells, pan-y on hour labels, pan-x on date headers", async ({ page }) => {
    await page.goto("/dev/day-hour-grid?dates=7");

    await expect(page.getByRole("gridcell").first()).toHaveCSS("touch-action", "manipulation");
    await expect(page.getByRole("rowheader").first()).toHaveCSS("touch-action", "pan-y");
    await expect(page.getByRole("columnheader").first()).toHaveCSS("touch-action", "pan-x");
  });

  test("snaps 7 dates to a whole date when scrolled sideways", async ({ page, isMobile }) => {
    test.skip(!isMobile, "all 7 dates fit at 1440");
    await page.goto("/dev/day-hour-grid?dates=7");
    const grid = page.getByRole("grid", { name: "Kiedy możesz?" });

    const pitch = await page
      .getByRole("columnheader")
      .nth(1)
      .evaluate((second) => {
        const first = second.previousElementSibling as HTMLElement;

        return second.getBoundingClientRect().left - first.getBoundingClientRect().left;
      });

    await grid.evaluate((element) => element.scrollBy({ left: 60, behavior: "instant" }));

    await expect.poll(() => grid.evaluate((element, snap) => Math.abs(element.scrollLeft - snap), pitch)).toBeLessThanOrEqual(1);
  });

  test("a mouse drag across cells paints the rectangle between the first and the last cell", async ({ page }) => {
    await page.goto("/dev/day-hour-grid?dates=7");

    await mouseDrag(page, await centreOf(cell(page, "pt 16, 13:00")), await centreOf(cell(page, "nd 18, 15:00")));

    for (const name of ["pt 16, 13:00", "sb 17, 14:00", "nd 18, 15:00"]) {
      await expect(page.getByRole("gridcell", { selected: true }).filter({ has: cell(page, name) })).toHaveCount(1);
    }

    await expect(page.getByRole("gridcell", { selected: true })).toHaveCount(9);
  });

  test.describe("on a 320px phone", () => {
    test.use({ viewport: { width: 320, height: 640 } });

    test("keeps 7 dates at least 56px wide", async ({ page }) => {
      await page.goto("/dev/day-hour-grid?dates=7");

      const width = await cell(page, "pt 16, 19:00").evaluate((element) => element.getBoundingClientRect().width);

      expect(width).toBeGreaterThanOrEqual(56);
    });
  });

  test("shows part of the fifth of 7 dates at the edge of a phone", async ({ page, isMobile }) => {
    test.skip(!isMobile, "all 7 dates fit at 1440");
    await page.goto("/dev/day-hour-grid?dates=7");

    const gridRight = await page.getByRole("grid", { name: "Kiedy możesz?" }).evaluate((element) => element.getBoundingClientRect().right);

    const fifth = await page
      .getByRole("columnheader")
      .nth(4)
      .evaluate((element) => element.getBoundingClientRect().toJSON() as DOMRect);

    const shown = (gridRight - fifth.left) / fifth.width;

    expect(shown).toBeGreaterThan(0.3);
    expect(shown).toBeLessThan(0.5);
  });

  test.describe("on a touch screen", () => {
    test.skip(({ isMobile }) => !isMobile, "the desktop project has no touch");

    test("a tap toggles one cell", async ({ page }) => {
      await page.goto("/dev/day-hour-grid?dates=7");

      await cell(page, "pt 16, 13:00").tap();

      await expect(page.getByRole("gridcell", { selected: true })).toHaveCount(1);
      await expect(page.getByRole("gridcell", { selected: true }).filter({ has: cell(page, "pt 16, 13:00") })).toHaveCount(1);
    });

    test("a finger that moves at once marks nothing and leaves the page free to scroll; one that holds first marks three cells and keeps the page still", async ({
      page,
    }) => {
      await page.goto("/dev/day-hour-grid?dates=7");
      const from = await centreOf(cell(page, "pt 16, 13:00"));
      const to = await centreOf(cell(page, "pt 16, 15:00"));

      expect(await dispatchedTouchDrag(page, from, to, 0)).toEqual({ scrollAllowed: true });
      await expect(page.getByRole("gridcell", { selected: true })).toHaveCount(0);

      expect(await dispatchedTouchDrag(page, from, to, 400)).toEqual({ scrollAllowed: false });
      await expect(page.getByRole("gridcell", { selected: true })).toHaveCount(3);
    });
  });

  test.describe("on a touch screen driven through Chromium's input pipeline", () => {
    test.skip(
      ({ browserName, isMobile }) => browserName !== "chromium" || !isMobile,
      "Playwright drives touch moves only through Chromium's CDP",
    );

    test("a vertical swipe that starts on a cell scrolls the page and marks nothing", async ({ page }) => {
      await page.goto("/dev/day-hour-grid?dates=7");
      const from = await centreOf(cell(page, "pt 16, 13:00"));

      await touchDrag(page, from, { x: from.x, y: from.y - 200 });

      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
      await expect(page.getByRole("gridcell", { selected: true })).toHaveCount(0);
    });

    test("a sideways swipe that starts on a cell scrolls the dates and marks nothing", async ({ page }) => {
      await page.goto("/dev/day-hour-grid?dates=7");
      const grid = page.getByRole("grid", { name: "Kiedy możesz?" });
      const from = await centreOf(cell(page, "sb 17, 13:00"));

      await touchDrag(page, from, { x: from.x - 150, y: from.y });

      await expect.poll(() => grid.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
      await expect(page.getByRole("gridcell", { selected: true })).toHaveCount(0);
    });

    test("a hold then a drag over three cells marks them and scrolls nothing", async ({ page }) => {
      await page.goto("/dev/day-hour-grid?dates=7");
      await page.evaluate(() => window.scrollTo(0, 100));
      const grid = page.getByRole("grid", { name: "Kiedy możesz?" });

      await touchHoldDrag(page, await centreOf(cell(page, "pt 16, 13:00")), await centreOf(cell(page, "nd 18, 13:00")));

      await expect(page.getByRole("gridcell", { selected: true })).toHaveCount(3);

      for (const name of ["pt 16, 13:00", "sb 17, 13:00", "nd 18, 13:00"]) {
        await expect(page.getByRole("gridcell", { selected: true }).filter({ has: cell(page, name) })).toHaveCount(1);
      }

      expect(await page.evaluate(() => window.scrollY)).toBe(100);
      expect(await grid.evaluate((element) => element.scrollLeft)).toBe(0);
    });

    test("a vertical swipe on the hour column scrolls the page", async ({ page }) => {
      await page.goto("/dev/day-hour-grid?dates=7");
      const from = await centreOf(page.getByRole("button", { name: "16:00", exact: true }));

      await touchDrag(page, from, { x: from.x, y: from.y - 200 });

      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
      await expect(page.getByRole("gridcell", { selected: true })).toHaveCount(0);
    });

    test("a sideways swipe on the header scrolls the dates", async ({ page }) => {
      await page.goto("/dev/day-hour-grid?dates=7");
      const grid = page.getByRole("grid", { name: "Kiedy możesz?" });
      const from = await centreOf(page.getByRole("button", { name: "nd 18", exact: true }));

      await touchDrag(page, from, { x: from.x - 150, y: from.y });

      await expect.poll(() => grid.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
    });
  });
});
