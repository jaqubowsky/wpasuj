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

export async function saveScreenshot(page: Page, testInfo: TestInfo, screen: string) {
  await settleAnimations(page);

  const { width, height, scale } = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight,
    scale: window.devicePixelRatio,
  }));

  await page.screenshot({
    path: `e2e/screenshots/${screen}-${testInfo.project.name}.png`,
    fullPage: true,
    clip: { x: 0, y: 0, width, height: Math.min(height, Math.floor(largestImage / scale)) },
  });
}
