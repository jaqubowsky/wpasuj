import { test as base } from "@playwright/test";

export { expect } from "@playwright/test";

export const test = base.extend<{ closeContextsOpenedByTest: void }>({
  closeContextsOpenedByTest: [
    async ({ browser }, use) => {
      const openBefore = new Set(browser.contexts());

      await use();

      await Promise.all(
        browser
          .contexts()
          .filter((context) => !openBefore.has(context))
          .map((context) => context.close()),
      );
    },
    { auto: true },
  ],
});
