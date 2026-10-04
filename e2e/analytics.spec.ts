import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { stubClipboardWithoutShareSheet } from "./clipboard";
import { saveScreenshot } from "./screenshot";
import { seedPoll } from "./seed";

const scriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;
const website = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
const configured = !!scriptUrl && !!website;
const script = process.env.UMAMI_TEST_SCRIPT ? readFileSync(process.env.UMAMI_TEST_SCRIPT, "utf8") : "";

type Payload = { type: string; payload: { website: string; url: string; name?: string; referrer?: string; data?: Record<string, string> } };

async function interceptAnalytics(page: Page) {
  const payloads: Payload[] = [];
  const requests: { url: string; headers: Record<string, string>; body: string | null }[] = [];

  if (configured && !script) throw new Error("Configured payload verification requires UMAMI_TEST_SCRIPT pointing to the upstream tracker");

  await page.route("**/*", async (route) => {
    const request = route.request();

    if (new URL(request.url()).origin === "http://localhost:3000") return route.continue();

    requests.push({ url: request.url(), headers: await request.allHeaders(), body: request.postData() });
    if (request.url() === scriptUrl)
      return route.fulfill({
        contentType: "application/javascript",
        headers: { "Access-Control-Allow-Origin": "http://localhost:3000" },
        body: script,
      });
    if (request.method() === "POST") payloads.push(request.postDataJSON());

    return route.fulfill({
      contentType: "application/json",
      headers: { "Access-Control-Allow-Origin": "http://localhost:3000" },
      body: "{}",
    });
  });

  return { payloads, requests };
}

async function createPoll(page: Page) {
  await page.getByRole("textbox", { name: "Co robimy?" }).fill("private-title");
  await page.getByRole("button", { name: "Jutro", exact: true }).click();
  await page.getByRole("textbox", { name: "Twoje imię" }).fill("private-name");
  await page.getByRole("button", { name: "Utwórz i wyślij na grupę" }).click();
}

test("the create and organiser funnel sends sanitized explicit payloads", async ({ page }, testInfo) => {
  const { payloads, requests } = await interceptAnalytics(page);

  await stubClipboardWithoutShareSheet(page);

  await page.goto("/?utm_source=linkedin&utm_medium=social&utm_campaign=launch&token=private-token&title=private-title#private-fragment", {
    referer: "https://google.com/search?q=private-name&token=private-token",
  });

  await expect(page.getByRole("textbox", { name: "Co robimy?" })).toBeVisible();
  if (configured) await expect.poll(() => payloads.length).toBe(1);

  await page.getByRole("button", { name: "Utwórz i wyślij na grupę" }).click();
  await expect(page.getByText("Wpisz, co robicie")).toBeVisible();
  await createPoll(page);
  await expect(page).toHaveURL(/\/e\/[A-Za-z0-9_-]{10}$/);
  await expect(page.getByRole("heading", { level: 1, name: "private-title" })).toBeVisible();
  const pollPath = new URL(page.url()).pathname;
  const organiserToken = (await page.context().cookies()).find((cookie) => cookie.name.endsWith("-org"))!.value;

  await page.getByRole("button", { name: "Wyślij na grupę", exact: true }).click();
  await expect(page.getByRole("button", { name: "Skopiowano", exact: true })).toBeVisible();
  const cells = page.getByRole("grid", { name: "Kiedy możesz?" }).getByRole("row").nth(1).getByRole("button");

  await cells.nth(1).click();
  await expect(page.getByRole("status")).toHaveText("Zapisane");
  await cells.nth(1).click();
  await expect(page.getByRole("status")).toHaveText("Zapisane");
  await cells.nth(1).click();
  await expect(page.getByRole("status")).toHaveText("Zapisane");
  await page.getByRole("tab", { name: "Wszyscy" }).click();
  await page.getByRole("tab", { name: "Wszyscy" }).click();
  await page.getByRole("region", { name: "Twoja ankieta" }).getByRole("button", { name: "Ustal termin" }).click();
  await expect(page.getByRole("button", { name: "Dodaj do kalendarza" })).toBeVisible();
  await page.getByRole("button", { name: "Dodaj do kalendarza" }).click();
  await expect(page.getByRole("dialog", { name: "Dodaj do kalendarza" })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Wyślij termin na grupę" }).click();
  await expect(page.getByRole("button", { name: "Skopiowano" })).toBeVisible();

  const names = [
    "create_started",
    "create_submitted",
    "create_validation_failed",
    "create_submitted",
    "poll_created",
    "poll_entered",
    "invite_share_clicked",
    "invite_copied",
    "availability_started",
    "answer_first_saved",
    "answer_changed_saved",
    "answer_changed_saved",
    "results_opened",
    "time_set",
    "calendar_clicked",
    "settled_share_clicked",
  ];

  if (configured) await expect.poll(() => payloads.length).toBe(names.length + 1);

  expect(payloads).toEqual(
    configured
      ? [
          {
            type: "event",
            payload: { website, url: "/?utm_source=linkedin&utm_medium=social&utm_campaign=launch", referrer: "https://google.com/" },
          },
          ...names.map((name, index) => ({
            type: "event",
            payload: {
              website,
              url: index < 5 ? "/" : "/e/[id]",
              name,
              ...(index < 5 ? { data: { utm_source: "linkedin", utm_medium: "social", utm_campaign: "launch" } } : {}),
            },
          })),
        ]
      : [],
  );

  await page.reload({ waitUntil: "networkidle" });
  await page.goto(`${pollPath}/organizator/${organiserToken}`, { waitUntil: "networkidle" });
  await expect(page).toHaveURL(pollPath);

  await page.goto("/polityka-prywatnosci", {
    waitUntil: "networkidle",
    referer: `http://localhost:3000${pollPath}/organizator/${organiserToken}`,
  });

  if (configured) {
    expect(payloads.slice(names.length + 1)).toEqual([
      { type: "event", payload: { website, url: "/e/[id]", name: "poll_entered" } },
      { type: "event", payload: { website, url: "/e/[id]", name: "poll_entered" } },
      { type: "event", payload: { website, url: "/polityka-prywatnosci" } },
    ]);
  }

  for (const request of requests) {
    expect(request.headers.cookie).toBeUndefined();
    expect(request.headers.authorization).toBeUndefined();
    expect(request.headers.referer).toBeUndefined();
    expect(JSON.stringify(request)).not.toContain("private-");
    expect(JSON.stringify(request)).not.toContain(organiserToken);
    expect(JSON.stringify(request)).not.toContain(pollPath.slice(3));
  }

  if (!configured) expect(requests).toEqual([]);

  await testInfo.attach("analytics-requests", { body: JSON.stringify(requests, null, 2), contentType: "application/json" });
});

test("participant saves and failures never send private defaults or inferred successes", async ({ page }, testInfo) => {
  const { payloads, requests } = await interceptAnalytics(page);
  const pollId = seedPoll({ dates: ["2030-10-19"], firstHour: 18, hourCount: 2, title: "private-title" });

  await page.goto(`/e/${pollId}?token=private-token&utm_source=linkedin#private-fragment`, {
    referer: "https://google.com/e/private-id?name=private-name",
  });

  await expect(page.getByRole("textbox", { name: "Twoje imię" })).toBeVisible();
  if (configured) await expect.poll(() => payloads.length).toBe(1);

  await page.getByRole("textbox", { name: "Twoje imię" }).fill("private-name");
  const cells = page.getByRole("grid", { name: "Kiedy możesz?" }).getByRole("row").nth(1).getByRole("button");

  await cells.nth(1).click();
  await expect(page.getByRole("status")).toHaveText("Zapisane");
  await page.route(`**/e/${pollId}*`, (route) => (route.request().method() === "POST" ? route.abort() : route.continue()));
  await cells.nth(1).click();
  await expect(page.getByRole("status")).toHaveText("Nie zapisano");
  await page.unroute(`**/e/${pollId}*`);
  await page.getByRole("button", { name: "Spróbuj ponownie" }).click();
  await expect(page.getByRole("status")).toHaveText("Zapisane");
  await page.getByRole("link", { name: "Też coś planujesz? Zrób własną ankietę" }).click();
  await expect(page).toHaveURL("/");

  const names = [
    "poll_entered",
    "availability_started",
    "answer_first_saved",
    "answer_save_failed",
    "answer_changed_saved",
    "own_poll_clicked",
  ];

  if (configured) await expect.poll(() => payloads.length).toBe(names.length + 1);

  expect(payloads).toEqual(
    configured
      ? [
          ...names.map((name) => ({ type: "event", payload: { website, url: "/e/[id]", name } })),
          { type: "event", payload: { website, url: "/", referrer: "https://google.com/" } },
        ]
      : [],
  );

  for (const request of requests) {
    expect(request.headers.referer).toBeUndefined();
    expect(request.headers.cookie).toBeUndefined();
    expect(JSON.stringify(request)).not.toContain(pollId);
    expect(JSON.stringify(request)).not.toContain("private-");
  }

  await testInfo.attach("participant-analytics-requests", { body: JSON.stringify(requests, null, 2), contentType: "application/json" });
});

test("public informational pages keep approved acquisition and reject private defaults", async ({ page }, testInfo) => {
  const { payloads, requests } = await interceptAnalytics(page);

  await page.goto("/jak-ustalic-termin?token=private-token#private-fragment", {
    referer: "https://google.com/e/private-id?name=private-name&token=private-token",
  });

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  if (configured) await expect.poll(() => payloads.length).toBe(1);

  await page.getByRole("link", { name: "Polityka prywatności", exact: true }).click();
  await expect(page).toHaveURL("/polityka-prywatnosci");
  if (configured) await expect.poll(() => payloads.length).toBe(2);

  expect(payloads).toEqual(
    configured
      ? [
          { type: "event", payload: { website, url: "/jak-ustalic-termin", referrer: "https://google.com/" } },
          { type: "event", payload: { website, url: "/polityka-prywatnosci", referrer: "https://google.com/" } },
        ]
      : [],
  );

  await page.goto("/regulamin", { referer: "https://unapproved.example/e/private-id?token=private-token" });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  if (configured) await expect.poll(() => payloads.length).toBe(3);

  expect(payloads.slice(2)).toEqual(configured ? [{ type: "event", payload: { website, url: "/regulamin" } }] : []);

  for (const request of requests) {
    expect(request.headers.referer).toBeUndefined();
    expect(request.headers.cookie).toBeUndefined();
    expect(JSON.stringify(request)).not.toContain("private-");
    expect(JSON.stringify(request)).not.toContain("unapproved.example");
  }

  await testInfo.attach("public-source-payloads", { body: JSON.stringify(requests, null, 2), contentType: "application/json" });
});

test("failed creation sends interactions but no success event", async ({ page }, testInfo) => {
  const { payloads } = await interceptAnalytics(page);

  await page.route("http://localhost:3000/", (route) => (route.request().method() === "POST" ? route.abort() : route.continue()));
  await page.goto("/");
  if (configured) await expect.poll(() => payloads.length).toBe(1);

  await createPoll(page);

  await expect(page.getByRole("alert").filter({ hasText: "Nie udało się utworzyć ankiety" })).toBeVisible();
  if (configured) await expect.poll(() => payloads.length).toBe(3);

  expect(payloads).toEqual(
    configured
      ? [
          { type: "event", payload: { website, url: "/" } },
          { type: "event", payload: { website, url: "/", name: "create_started" } },
          { type: "event", payload: { website, url: "/", name: "create_submitted" } },
        ]
      : [],
  );

  await testInfo.attach("failed-create-payloads", { body: JSON.stringify(payloads, null, 2), contentType: "application/json" });
});

for (const unavailable of ["script", "collector"]) {
  test(`unavailable ${unavailable} does not prevent creation`, async ({ page }) => {
    await page.route("**/*", (route) => {
      if (new URL(route.request().url()).origin === "http://localhost:3000") return route.continue();
      if (unavailable === "collector" && route.request().url() === scriptUrl)
        return route.fulfill({
          contentType: "application/javascript",
          body: script,
          headers: { "Access-Control-Allow-Origin": "http://localhost:3000" },
        });

      return route.abort();
    });

    await page.goto("/");
    if (configured && unavailable === "collector") await expect.poll(() => page.evaluate(() => !!window.umami)).toBe(true);

    await createPoll(page);

    await expect(page).toHaveURL(/\/e\/[A-Za-z0-9_-]{10}$/);
    await expect(page.getByRole("heading", { level: 1, name: "private-title" })).toBeVisible();
  });
}

test("the privacy policy explains optional funnel statistics", async ({ page }, testInfo) => {
  await page.route("**/*", (route) =>
    new URL(route.request().url()).origin === "http://localhost:3000" ? route.continue() : route.abort(),
  );

  await page.goto("/polityka-prywatnosci");

  await expect(page.getByRole("heading", { name: "Statystyki", exact: true })).toBeVisible();
  await expect(page.getByText(/Nie wysyłamy adresów ankiet/)).toBeVisible();
  await saveScreenshot(page, testInfo, "privacy-umami");
});
