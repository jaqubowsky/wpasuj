import type { Page, TestInfo } from "@playwright/test";

export async function saveScreenshot(page: Page, testInfo: TestInfo, screen: string) {
  const viewport = page.viewportSize()!;
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.setViewportSize({ width: viewport.width, height: Math.max(height, viewport.height) });
  await page.screenshot({ path: `e2e/screenshots/${screen}-${testInfo.project.name}.png` });
  await page.setViewportSize(viewport);
}
