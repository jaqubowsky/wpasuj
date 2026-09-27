import { fakeCookies } from "@/shared/testing/fake-cookies";
import { openTestDatabase } from "@/shared/testing/test-database";
import { beforeEach, expect, it, vi } from "vitest";

let cookieJar = fakeCookies();
vi.mock("next/headers", () => ({ cookies: async () => cookieJar }));
vi.mock("server-only", () => ({}));

let pollId: string;
let token: string;

async function open(id: string, withToken: string) {
  const { GET } = await import("./route");
  return GET(new Request(`http://localhost/e/${id}/organizator/${withToken}`), { params: Promise.resolve({ id, token: withToken }) });
}

beforeEach(async () => {
  cookieJar = fakeCookies();
  await openTestDatabase();
  const { createPoll } = await import("@/modules/create-poll/server/create-poll-action");
  const result = await createPoll({
    title: "Kino",
    dates: ["2030-10-16"],
    firstHour: 17,
    lastHour: 23,
    timeZone: "Europe/Warsaw",
    organiserName: "Kuba",
  });
  pollId = result.ok ? result.id : "";
  token = cookieJar.get(`${pollId}-org`)?.value ?? "";
  cookieJar = fakeCookies();
});

it("makes this device the organiser and opens the poll", async () => {
  const response = await open(pollId, token);

  expect(response.status).toBe(303);
  expect(response.headers.get("location")).toBe(`/e/${pollId}`);
  expect(cookieJar.get(`${pollId}-org`)?.value).toBe(token);
});

it("opens the poll without organiser rights for a wrong token", async () => {
  const response = await open(pollId, "not-the-token");

  expect(response.headers.get("location")).toBe(`/e/${pollId}`);
  expect(cookieJar.getAll()).toEqual([]);
});
