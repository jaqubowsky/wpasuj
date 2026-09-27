import type { Page } from "@playwright/test";

declare global {
  interface Window {
    copied?: string;
  }
}

export async function stubClipboardWithoutShareSheet(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          window.copied = text;
        },
      },
    });
  });
}
