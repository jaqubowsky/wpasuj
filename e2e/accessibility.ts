import { AxeBuilder } from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

const wcag22aa = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"];

const decorativeText = "[data-quote-ghost]";

export async function expectAccessible(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(wcag22aa).exclude(decorativeText).analyze();

  expect(
    violations.map(({ id, help, nodes }) => ({
      id,
      help,
      targets: nodes.map((node) => `${node.target.join(" ")} ${node.failureSummary}`),
    })),
  ).toEqual([]);
}
