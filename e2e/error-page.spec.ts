import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { serverLogPath } from "../playwright.config";
import { expect, test } from "./fixtures";
import { saveScreenshot } from "./screenshot";

const clientRenderFailures = () =>
  readFileSync(serverLogPath, "utf8")
    .split("\n")
    .filter((line) => line.includes('"client_render_failed"') && line.includes('"hasDigest":false'));

test("a server error shows the Polish error page, and trying again renders the page anew", async ({ page }, testInfo) => {
  await page.goto(`/dev/error?run=${randomUUID()}`);

  await expect(page.getByRole("heading", { name: "Coś poszło nie tak" })).toBeVisible();
  await saveScreenshot(page, testInfo, "error-page");
  await page.getByRole("button", { name: "Spróbuj ponownie" }).click();

  await expect(page.getByRole("heading", { name: "Druga próba działa" })).toBeVisible();
});

test("the error page links to a new poll", async ({ page }) => {
  await page.goto(`/dev/error?run=${randomUUID()}`);

  await page.getByRole("link", { name: "Zrób własną ankietę" }).click();

  await expect(page.getByRole("textbox", { name: "Co robimy?" })).toBeVisible();
});

test("a client render error shows the Polish error page and writes one client_render_failed line", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "the three projects share one server log when run together");
  const failuresBefore = clientRenderFailures().length;
  const reports: string[] = [];

  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/api/render-errors") reports.push(request.url());
  });

  const reported = page.waitForResponse("**/api/render-errors");

  await page.goto("/dev/client-error");

  await expect(page.getByRole("heading", { name: "Coś poszło nie tak" })).toBeVisible();
  expect((await reported).status()).toBe(204);
  await page.waitForLoadState("networkidle");
  expect(reports).toHaveLength(1);

  expect(
    clientRenderFailures()
      .slice(failuresBefore)
      .map((line) => JSON.parse(line)),
  ).toEqual([{ level: "error", message: "client_render_failed", errorName: "Error", hasDigest: false, route: "other" }]);
});
