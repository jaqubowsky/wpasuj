import type { Page, TestInfo } from "@playwright/test";

export async function saveScreenshot(page: Page, testInfo: TestInfo, screen: string) {
  await page.evaluate(() => Promise.all(document.getAnimations().map((animation) => animation.finished)));
  await page.screenshot({
    path: `e2e/screenshots/${screen}-${testInfo.project.name}.png`,
    fullPage: true,
  });
}
