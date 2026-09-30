import { loggedLines } from "@/shared/testing/logged-lines";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let requestHeaders = new Headers();

vi.mock("next/headers", () => ({ headers: async () => requestHeaders }));

const wednesdayMorning = new Date("2026-09-30T08:15:00Z");
const linearKey = "lin_api_test";

const report = {
  text: "Nie mogę zaznaczyć godzin",
  contact: "ola@example.com",
  website: "",
  path: "/e/Ab3_x-9Qz0/organizator/s3cretOrganiserToken",
  viewport: { width: 390, height: 844 },
};

let linear: ReturnType<typeof vi.fn>;
let nextAddress = 0;

function answeringLinear(body: unknown, status = 200) {
  return vi.fn(async () => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));
}

const filed = { data: { issueCreate: { success: true, issue: { identifier: "WPA-123" } } } };

async function reportProblem(input: typeof report) {
  const { reportProblem } = await import("./report-action");

  return reportProblem(input);
}

function sentRequest() {
  const [url, init] = linear.mock.calls[0] as [string, RequestInit];

  return { url, headers: new Headers(init.headers), body: JSON.parse(String(init.body)), signal: init.signal };
}

beforeEach(() => {
  nextAddress += 1;
  requestHeaders = new Headers({ "x-real-ip": `203.0.113.${nextAddress}`, "user-agent": "Mozilla/5.0 (iPhone) Safari/605.1.15" });
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(wednesdayMorning);
  vi.stubEnv("LINEAR_API_KEY", linearKey);
  linear = answeringLinear(filed);
  vi.stubGlobal("fetch", linear);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("reportProblem", () => {
  it("files one triage issue in the Wpasuj team with the text, the contact and the masked path", async () => {
    const result = await reportProblem(report);

    expect(result).toEqual({ ok: true });
    expect(linear).toHaveBeenCalledTimes(1);
    const { url, headers, body, signal } = sentRequest();

    expect(url).toBe("https://api.linear.app/graphql");
    expect(headers.get("Authorization")).toBe(linearKey);
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(body.query).toContain("issueCreate");

    expect(body.variables.input).toEqual({
      teamId: "5022a401-c39d-49f6-8ceb-c71be267c54e",
      stateId: "443dd690-c5ff-42f0-ae78-2b660148453c",
      labelIds: ["c4d46511-9711-46bd-9520-2326efaa28a1"],
      title: "Nie mogę zaznaczyć godzin",
      description: expect.any(String),
    });

    const description: string = body.variables.input.description;

    expect(description.split("\n")[0]).toBe("Filed from the in-app “Zgłoś problem” form.");
    expect(description).toContain("Nie mogę zaznaczyć godzin");
    expect(description).toContain("ola@example.com");
    expect(description).toContain("/e/Ab3_x-9Qz0/organizator/[token]");
    expect(description).not.toContain("s3cretOrganiserToken");
    expect(description).toContain("Ab3_x-9Qz0");
    expect(description).toContain("Mozilla/5.0 (iPhone) Safari/605.1.15");
    expect(description).toContain("390×844");
    expect(description).toContain("2026-09-30T08:15:00.000Z");
  });

  it("titles the issue with the first line of the text, cut to 80 characters", async () => {
    await reportProblem({
      ...report,
      text: `  ${"Przycisk znika po kliknięciu i nie da się już niczego zaznaczyć na siatce godzin".padEnd(90, ".")}\nszczegóły`,
    });

    expect(sentRequest().body.variables.input.title).toBe(
      "Przycisk znika po kliknięciu i nie da się już niczego zaznaczyć na siatce godzin",
    );
  });

  it("writes report_filed with the issue identifier and no text", async () => {
    const lines = loggedLines("log");

    await reportProblem(report);

    expect(lines().map((line) => JSON.parse(line))).toEqual([{ level: "info", message: "report_filed", issue: "WPA-123" }]);
  });

  it.each([
    ["an empty text", { text: "   " }],
    ["a text over 2000 characters", { text: "a".repeat(2001) }],
    ["a contact over 200 characters", { contact: "a".repeat(201) }],
  ])("refuses %s and sends nothing to Linear", async (_, change) => {
    const result = await reportProblem({ ...report, ...change });

    expect(result).toEqual({ ok: false, reason: "invalid" });
    expect(linear).not.toHaveBeenCalled();
  });

  it("answers a filled honeypot as a success and sends nothing", async () => {
    const result = await reportProblem({ ...report, website: "https://spam.example" });

    expect(result).toEqual({ ok: true });
    expect(linear).not.toHaveBeenCalled();
  });

  it("refuses a sixth report from one address within an hour and takes it again after the hour", async () => {
    for (let sent = 0; sent < 5; sent += 1) {
      expect(await reportProblem(report)).toEqual({ ok: true });
      vi.setSystemTime(new Date(wednesdayMorning.getTime() + (sent + 1) * 10 * 60_000));
    }

    const sixth = await reportProblem(report);

    vi.setSystemTime(new Date(wednesdayMorning.getTime() + 60 * 60_000 + 1));
    const afterTheHour = await reportProblem(report);

    expect(sixth).toEqual({ ok: false, reason: "too-many" });
    expect(afterTheHour).toEqual({ ok: true });
    expect(linear).toHaveBeenCalledTimes(6);
  });

  it("keeps each address to its own count", async () => {
    for (let sent = 0; sent < 5; sent += 1) await reportProblem(report);

    requestHeaders = new Headers({ "x-real-ip": "198.51.100.7" });

    expect(await reportProblem(report)).toEqual({ ok: true });
  });

  it.each([
    ["no LINEAR_API_KEY", () => vi.stubEnv("LINEAR_API_KEY", "")],
    [
      "a network error",
      () =>
        vi.stubGlobal(
          "fetch",
          vi.fn(async () => Promise.reject(new TypeError("fetch failed"))),
        ),
    ],
    ["an HTTP error from Linear", () => vi.stubGlobal("fetch", answeringLinear({ errors: [{ message: "Authentication required" }] }, 400))],
    [
      "a GraphQL error from Linear",
      () => vi.stubGlobal("fetch", answeringLinear({ errors: [{ message: "Entity not found" }], data: null })),
    ],
    [
      "an unsuccessful issueCreate",
      () => vi.stubGlobal("fetch", answeringLinear({ data: { issueCreate: { success: false, issue: null } } })),
    ],
  ])("answers %s with unavailable and an error line without the text", async (_, breakLinear) => {
    breakLinear();
    const errors = loggedLines("error");

    const result = await reportProblem(report);

    expect(result).toEqual({ ok: false, reason: "unavailable" });
    expect(errors()).toHaveLength(1);
    expect(JSON.parse(errors()[0])).toMatchObject({ level: "error", message: "report_failed" });
    expect(errors()[0]).not.toContain("Nie mogę");
    expect(errors()[0]).not.toContain("ola@example.com");
  });
});
