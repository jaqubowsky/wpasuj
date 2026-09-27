import type { Page, TestInfo } from "@playwright/test";

const largestImage = 32767;

export async function settleAnimations(page: Page) {
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation.timeline === document.timeline && animation.effect?.getTiming().iterations !== Infinity)
        .map((animation) => animation.finished),
    ),
  );
}

export async function saveScreenshot(page: Page, testInfo: TestInfo, screen: string) {
  await settleAnimations(page);
  const viewport = page.viewportSize()!;
  const { height, scale } = await page.evaluate(() => ({ height: document.documentElement.scrollHeight, scale: window.devicePixelRatio }));
  await page.setViewportSize({ width: viewport.width, height: Math.min(Math.max(height, viewport.height), Math.floor(largestImage / scale)) });
  await page.screenshot({ path: `e2e/screenshots/${screen}-${testInfo.project.name}.png` });
  await page.setViewportSize(viewport);
}
