import { randomUUID } from "node:crypto";
import { expect, test } from "./fixtures";
import { seedPoll } from "./seed";

const pages = [
  { name: "a poll page", path: () => `/e/${seedPoll({ dates: ["2031-10-17"], firstHour: 18, hourCount: 4 })}` },
  { name: "the terms", path: () => "/regulamin" },
  { name: "the error page", path: () => `/dev/error?run=${randomUUID()}` },
];

for (const { name, path } of pages) {
  test(`the logo on ${name} opens the landing`, async ({ page }) => {
    await page.goto(path());

    await page.getByRole("link", { name: "Wpasuj, strona główna" }).click();

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("button", { name: "Wpasuj, na górę strony" })).toBeVisible();
  });
}
