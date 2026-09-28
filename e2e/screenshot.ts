import type { Page, TestInfo } from "@playwright/test";

const largestImage = 32767;

export async function settleAnimations(page: Page) {
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation.timeline === document.timeline && animation.effect?.getTiming().iterations !== Infinity)
        .map((animation) => animation.finished.catch(() => undefined)),
    ),
  );
}

async function loadLazySections(page: Page) {
  const scrollY = await page.evaluate(() => window.scrollY);
  for (;;) {
    const placeholder = await page.evaluateHandle(() => {
      const first = document.querySelector("[data-lazy-placeholder]");
      first?.scrollIntoView();
      return first;
    });
    if (!placeholder.asElement()) break;
    await page.waitForFunction((element) => !element?.isConnected, placeholder);
  }
  await page.evaluate((y) => window.scrollTo(0, y), scrollY);
}

export async function saveScreenshot(page: Page, testInfo: TestInfo, screen: string) {
  await loadLazySections(page);
  await settleAnimations(page);
  const { width, height, scale } = await page.evaluate(() => {
    for (const animation of document.getAnimations()) {
      if (animation.timeline !== document.timeline && animation.effect instanceof KeyframeEffect) animation.effect.target?.setAttribute("data-screenshot-whole", "");
    }
    for (const element of document.querySelectorAll("body *")) {
      if (getComputedStyle(element).contentVisibility === "auto") element.setAttribute("data-screenshot-whole", "");
    }
    return { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight, scale: window.devicePixelRatio };
  });
  await page.screenshot({
    path: `e2e/screenshots/${screen}-${testInfo.project.name}.png`,
    fullPage: true,
    clip: { x: 0, y: 0, width, height: Math.min(height, Math.floor(largestImage / scale)) },
    style: "[data-screenshot-whole] { animation: none !important; content-visibility: visible !important; }",
  });
  await page.evaluate(() => document.querySelectorAll("[data-screenshot-whole]").forEach((element) => element.removeAttribute("data-screenshot-whole")));
}
