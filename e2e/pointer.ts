import type { Locator, Page } from "@playwright/test";

type Point = { x: number; y: number };

export async function centreOf(locator: Locator) {
  const box = await locator.boundingBox();

  if (!box) throw new Error("not visible");

  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

export async function centresOf(from: Locator, to: Locator) {
  await to.evaluate((element) => element.scrollIntoView({ block: "center" }));

  return [await centreOf(from), await centreOf(to)] as const;
}

function stepsBetween(from: Point, to: Point) {
  return Array.from({ length: 10 }, (_, step) => ({
    x: from.x + ((to.x - from.x) * (step + 1)) / 10,
    y: from.y + ((to.y - from.y) * (step + 1)) / 10,
  }));
}

export async function touchDrag(page: Page, from: Point, to: Point, beforeRelease?: () => Promise<void>) {
  const session = await page.context().newCDPSession(page);

  await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [from] });
  for (const point of stepsBetween(from, to)) await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [point] });
  await beforeRelease?.();
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

export async function mouseDrag(page: Page, from: Point, to: Point, beforeRelease?: () => Promise<void>) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  for (const point of stepsBetween(from, to)) await page.mouse.move(point.x, point.y);
  await beforeRelease?.();
  await page.mouse.up();
}
