import { polls } from "@/shared/db/schema";
import { openTestDatabase } from "@/shared/testing/test-database";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const pollId = "Pl4nszowki";

let db: Awaited<ReturnType<typeof openTestDatabase>>;

async function get(id: string) {
  const { GET } = await import("./route");

  return GET(new Request(`http://localhost/e/${id}/termin.ics`), { params: Promise.resolve({ id }) });
}

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2030-10-15T10:00:00Z"));
  db = await openTestDatabase();

  await db.insert(polls).values({
    id: pollId,
    title: "Planszówki u Michała",
    organiserName: "Kuba",
    dates: ["2030-10-19"],
    firstHour: 17,
    hourCount: 6,
    timeZone: "Europe/Warsaw",
    organiserTokenHash: "organiser",
    createdByParticipant: false,
    createdAt: new Date(),
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

it("serves the set time as a calendar file the browser opens, linked to the poll", async () => {
  await db.update(polls).set({ finalDate: "2030-10-19", finalFirstHour: 19, finalLastHour: 22 });
  vi.stubEnv("SITE_URL", "https://wpasuj.example");

  const response = await get(pollId);

  expect(response.status).toBe(200);
  expect(response.headers.get("content-type")).toBe("text/calendar; charset=utf-8");
  expect(response.headers.get("content-disposition")).toBe('inline; filename="termin.ics"');

  expect((await response.text()).split("\r\n")).toEqual(
    expect.arrayContaining([
      `UID:${pollId}@wpasuj.example`,
      "DTSTART:20301019T170000Z",
      "DTEND:20301019T200000Z",
      `URL:https://wpasuj.example/e/${pollId}`,
    ]),
  );
});

it("answers 404 while no time is set", async () => {
  const response = await get(pollId);

  expect(response.status).toBe(404);
});

it("answers 404 for a poll that does not exist", async () => {
  const response = await get("abcdefghij");

  expect(response.status).toBe(404);
});
