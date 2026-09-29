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

async function touchStroke(page: Page, from: Point, to: Point, holdMs: number, beforeRelease?: () => Promise<void>) {
  const session = await page.context().newCDPSession(page);

  await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [from] });
  await page.waitForTimeout(holdMs);
  for (const point of stepsBetween(from, to)) await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [point] });
  await beforeRelease?.();
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

export async function touchDrag(page: Page, from: Point, to: Point) {
  await touchStroke(page, from, to, 0);
}

export async function touchHoldDrag(page: Page, from: Point, to: Point, beforeRelease?: () => Promise<void>) {
  await touchStroke(page, from, to, 400, beforeRelease);
}

export async function dispatchedTouchDrag(page: Page, from: Point, to: Point, holdMs: number) {
  return page.evaluate(
    async ({ from, points, holdMs }) => {
      const target = document.elementFromPoint(from.x, from.y);

      if (!target) throw new Error("nothing under the finger");

      Element.prototype.setPointerCapture = () => {};

      const send = (type: "start" | "move" | "end", point: Point) => {
        target.dispatchEvent(
          new PointerEvent({ start: "pointerdown", move: "pointermove", end: "pointerup" }[type], {
            pointerId: 91,
            pointerType: "touch",
            isPrimary: true,
            bubbles: true,
            button: type === "move" ? -1 : 0,
            buttons: type === "end" ? 0 : 1,
            clientX: point.x,
            clientY: point.y,
          }),
        );

        return target.dispatchEvent(new Event(`touch${type}`, { bubbles: true, cancelable: true }));
      };

      send("start", from);
      await new Promise((resolve) => setTimeout(resolve, holdMs));
      const moves = points.map((point) => send("move", point));

      send("end", points.at(-1) ?? from);

      return { scrollAllowed: moves.every(Boolean) };
    },
    { from, points: stepsBetween(from, to), holdMs },
  );
}

export async function mouseDrag(page: Page, from: Point, to: Point, beforeRelease?: () => Promise<void>) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  for (const point of stepsBetween(from, to)) await page.mouse.move(point.x, point.y);
  await beforeRelease?.();
  await page.mouse.up();
}
