import { expect, test } from "@playwright/test";

type Shift = { startTime: number; value: number };

declare global {
  interface Window {
    landingPerf: { lcp?: { startTime: number; element: string }; longTasks: { startTime: number; duration: number }[]; shifts: Shift[] };
  }
}

const slow4g = { offline: false, latency: 562.5, downloadThroughput: (1474.56 * 1024) / 8, uploadThroughput: (675 * 1024) / 8 };

function cumulativeLayoutShift(shifts: Shift[]) {
  let worst = 0;
  let session: Shift[] = [];
  for (const shift of shifts) {
    const first = session[0];
    const last = session.at(-1);
    if (first && last && (shift.startTime - last.startTime > 1000 || shift.startTime - first.startTime > 5000)) session = [];
    session.push(shift);
    worst = Math.max(worst, session.reduce((sum, entry) => sum + entry.value, 0));
  }
  return worst;
}

test("the landing holds LCP, TBT and CLS on a throttled phone, story included", async ({ page }) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", slow4g);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.addInitScript(() => {
    window.landingPerf = { longTasks: [], shifts: [] };
    const describe = (element: Element | null) => (element ? `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}` : "none");
    new PerformanceObserver((list) => {
      const entry = list.getEntries().at(-1) as PerformanceEntry & { element: Element | null };
      window.landingPerf.lcp = { startTime: entry.startTime, element: describe(entry.element) };
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) window.landingPerf.longTasks.push({ startTime: entry.startTime, duration: entry.duration });
    }).observe({ type: "longtask", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
        if (!entry.hadRecentInput) window.landingPerf.shifts.push({ startTime: entry.startTime, value: entry.value });
      }
    }).observe({ type: "layout-shift", buffered: true });
  });

  await page.goto("/", { waitUntil: "networkidle" });
  const { firstContentfulPaint, lcp } = await page.evaluate(() => ({
    firstContentfulPaint: performance.getEntriesByName("first-contentful-paint")[0].startTime,
    lcp: window.landingPerf.lcp!,
  }));
  while (await page.evaluate(() => window.scrollY + window.innerHeight < document.documentElement.scrollHeight)) {
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(150);
  }
  await page.waitForLoadState("networkidle");
  const { longTasks, shifts } = await page.evaluate(() => window.landingPerf);

  const tbt = longTasks
    .filter((task) => task.startTime >= firstContentfulPaint)
    .reduce((sum, task) => sum + Math.max(0, task.duration - 50), 0);
  const cls = cumulativeLayoutShift(shifts);
  console.log(`LCP ${Math.round(lcp.startTime)} ms on ${lcp.element}, TBT ${Math.round(tbt)} ms, CLS ${cls.toFixed(3)} with the story scrolled through`);
  expect.soft(lcp.startTime).toBeLessThanOrEqual(2500);
  expect.soft(tbt).toBeLessThanOrEqual(200);
  expect.soft(cls).toBeLessThanOrEqual(0.1);
});
