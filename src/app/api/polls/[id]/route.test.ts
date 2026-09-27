import { participants, polls, slots } from "@/shared/db/schema";
import { openTestDatabase } from "@/shared/testing/test-database";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const now = new Date("2030-10-15T10:00:00Z");
const pollId = "Pl4nszowki";

let db: Awaited<ReturnType<typeof openTestDatabase>>;

async function get(id: string) {
  const { GET } = await import("./route");
  return GET(new Request(`http://localhost/api/polls/${id}`), { params: Promise.resolve({ id }) });
}

async function seedPoll(dates: string[]) {
  await db.insert(polls).values({
    id: pollId,
    title: "Planszówki u Michała",
    organiserName: "Kuba",
    dates,
    firstHour: 17,
    lastHour: 20,
    timeZone: "Europe/Warsaw",
    organiserTokenHash: "organiser",
    createdByParticipant: false,
    createdAt: now,
  });
}

async function seedAnswer(name: string, savedAt: Date, cells: [string, number][]) {
  const [{ id }] = await db
    .insert(participants)
    .values({ pollId, name, normalisedName: name.toLowerCase(), tokenHash: name, createdAt: savedAt, updatedAt: savedAt })
    .returning({ id: participants.id });
  if (cells.length > 0) await db.insert(slots).values(cells.map(([date, hour]) => ({ participantId: id, date, hour })));
}

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(now);
  db = await openTestDatabase();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

it("answers with the poll's grid and every respondent's free hours", async () => {
  await seedPoll(["2030-10-19", "2030-10-20"]);
  await seedAnswer("Ola", new Date("2030-10-15T08:00:00Z"), [
    ["2030-10-19", 18],
    ["2030-10-20", 17],
  ]);
  await seedAnswer("Bartek", new Date("2030-10-15T09:40:00Z"), []);

  const response = await get(pollId);

  expect(response.status).toBe(200);
  const { resultsSchema } = await import("@/modules/view-results/results-schema");
  expect(resultsSchema.parse(await response.json())).toEqual({
    dates: ["2030-10-19", "2030-10-20"],
    hours: [17, 18, 19],
    readAt: now.getTime(),
    respondents: [
      {
        name: "Ola",
        savedAt: Date.parse("2030-10-15T08:00:00Z"),
        slots: [
          { date: "2030-10-19", hour: 18 },
          { date: "2030-10-20", hour: 17 },
        ],
      },
      { name: "Bartek", savedAt: Date.parse("2030-10-15T09:40:00Z"), slots: [] },
    ],
    final: null,
  });
});

it("carries the time the organiser set", async () => {
  await seedPoll(["2030-10-19", "2030-10-20"]);
  await db.update(polls).set({ finalDate: "2030-10-20", finalFirstHour: 18, finalLastHour: 20 });

  const response = await get(pollId);

  const { resultsSchema } = await import("@/modules/view-results/results-schema");
  expect(resultsSchema.parse(await response.json()).final).toEqual({ date: "2030-10-20", firstHour: 18, lastHour: 20 });
});

it("answers 404 for a poll that does not exist", async () => {
  const response = await get("abcdefghij");

  expect(response.status).toBe(404);
});

it("answers 404 for a poll whose dates are long past", async () => {
  await seedPoll(["2030-08-01"]);

  const response = await get(pollId);

  expect(response.status).toBe(404);
});
