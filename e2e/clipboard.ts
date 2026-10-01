import type { Page } from "@playwright/test";

declare global {
  interface Window {
    copied?: string;
    shared?: { data: ShareData; fromTap: boolean }[];
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

export async function stubShareSheet(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async (data: ShareData) => {
        window.shared = [...(window.shared ?? []), { data, fromTap: navigator.userActivation.isActive }];
      },
    });
  });
}
