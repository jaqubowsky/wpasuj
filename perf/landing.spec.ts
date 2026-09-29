import { expect, test, type Page } from "@playwright/test";

type Shift = { startTime: number; value: number };

declare global {
  interface Window {
    landingPerf: { lcp?: { startTime: number; element: string }; longTasks: { startTime: number; duration: number }[]; shifts: Shift[] };
  }
}

const slow4g = { offline: false, latency: 562.5, downloadThroughput: (1474.56 * 1024) / 8, uploadThroughput: (675 * 1024) / 8 };

function benchmarkIndex() {
  function withGarbage() {
    const start = Date.now();
    let iterations = 0;

    while (Date.now() - start < 500) {
      let text = "";

      for (let j = 0; j < 10000; j++) text += "a";
      if (text.length === 1) throw new Error("keeps the loop from being optimised away");

      iterations++;
    }

    return Math.round(iterations / 10 / ((Date.now() - start) / 1000));
  }

  function withoutGarbage() {
    const first: number[] = [];
    const second: number[] = [];

    for (let i = 0; i < 100000; i++) first[i] = second[i] = i;
    const start = Date.now();
    let iterations = 0;

    while (iterations % 10 !== 0 || Date.now() - start < 500) {
      const [source, target] = iterations % 2 === 0 ? [first, second] : [second, first];

      for (let j = 0; j < source.length; j++) target[j] = source[j];
      iterations++;
    }

    return Math.round(iterations / 10 / ((Date.now() - start) / 1000));
  }

  return (withGarbage() + withoutGarbage()) / 2;
}

function midTierMobileSlowdown(index: number) {
  if (index >= 1500) return 4;

  return index >= 1000 ? 2 : 1;
}

function cumulativeLayoutShift(shifts: Shift[]) {
  let worst = 0;
  let session: Shift[] = [];

  for (const shift of shifts) {
    const first = session[0];
    const last = session.at(-1);

    if (first && last && (shift.startTime - last.startTime > 1000 || shift.startTime - first.startTime > 5000)) session = [];

    session.push(shift);

    worst = Math.max(
      worst,
      session.reduce((sum, entry) => sum + entry.value, 0),
    );
  }

  return worst;
}

const runs = 5;

function median(values: number[]) {
  return values.toSorted((a, b) => a - b)[Math.floor(values.length / 2)];
}

async function measure(page: Page, slowdown: number) {
  const cdp = await page.context().newCDPSession(page);

  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", slow4g);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: slowdown });

  await page.addInitScript(() => {
    window.landingPerf = { longTasks: [], shifts: [] };

    const describe = (element: Element | null) =>
      element ? `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}` : "none";

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

  return { lcp: lcp.startTime, element: lcp.element, tbt, cls: cumulativeLayoutShift(shifts) };
}

test("the landing holds LCP, TBT and CLS on a throttled phone, scrolled to its end", async ({ browser, page }, testInfo) => {
  test.setTimeout(runs * 60_000);
  const index = await page.evaluate(benchmarkIndex);
  const slowdown = midTierMobileSlowdown(index);
  const results = [];

  for (let run = 1; run <= runs; run++) {
    const context = await browser.newContext(testInfo.project.use);
    const result = await measure(await context.newPage(), slowdown);

    await context.close();
    results.push(result);

    console.log(
      `run ${run}: LCP ${Math.round(result.lcp)} ms on ${result.element}, TBT ${Math.round(result.tbt)} ms, CLS ${result.cls.toFixed(3)}`,
    );
  }

  const lcp = median(results.map((result) => result.lcp));
  const tbt = median(results.map((result) => result.tbt));
  const cls = median(results.map((result) => result.cls));

  console.log(
    `LCP ${Math.round(lcp)} ms, TBT ${Math.round(tbt)} ms, CLS ${cls.toFixed(3)}, medians of ${runs} runs scrolled to the end (benchmark index ${Math.round(index)}, CPU ${slowdown}x)`,
  );

  expect.soft(lcp).toBeLessThanOrEqual(2500);
  expect.soft(tbt).toBeLessThanOrEqual(250);
  expect.soft(cls).toBeLessThanOrEqual(0.1);
});
