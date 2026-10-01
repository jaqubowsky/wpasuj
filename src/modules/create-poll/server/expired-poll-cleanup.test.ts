import { participants, polls, slots } from "@/shared/db/schema";
import { fakeCookies } from "@/shared/testing/fake-cookies";
import { openTestDatabase } from "@/shared/testing/test-database";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ cookies: async () => fakeCookies(), headers: async () => new Headers() }));

const day = 24 * 60 * 60 * 1000;

let db: Awaited<ReturnType<typeof openTestDatabase>>;

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
  vi.setSystemTime(new Date("2026-10-15T10:00:00Z"));
  db = await openTestDatabase();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

async function pollOn(dates: string[], timeZone = "Europe/Warsaw") {
  const { createPoll } = await import("./create-poll-action");
  const created = await createPoll({ title: "Kino", dates, firstHour: 17, hourCount: 6, timeZone, organiserName: "Kuba" });
  const id = created.ok ? created.id : "";

  const [participant] = db
    .insert(participants)
    .values({ pollId: id, name: "Ola", normalisedName: "ola", tokenHash: `ola-${id}`, createdAt: new Date(), updatedAt: new Date() })
    .returning({ id: participants.id })
    .all();

  db.insert(slots).values({ participantId: participant.id, date: dates[0], hour: 18 }).run();

  return id;
}

function remaining() {
  return {
    polls: db
      .select({ id: polls.id })
      .from(polls)
      .all()
      .map((row) => row.id),
    participants: db
      .select({ pollId: participants.pollId })
      .from(participants)
      .all()
      .map((row) => row.pollId),
    slots: db.select().from(slots).all().length,
  };
}

async function cleanup() {
  const { scheduleExpiredPollCleanup } = await import("./expired-poll-cleanup");

  scheduleExpiredPollCleanup();
}

it("deletes a poll 61 days past its last date with its answers on start, and keeps one 59 days past", async () => {
  await pollOn(["2026-10-17"]);
  const kept = await pollOn(["2026-10-17", "2026-10-19"]);

  vi.setSystemTime(new Date("2026-12-17T14:00:00Z"));
  await cleanup();

  expect(remaining()).toEqual({ polls: [kept], participants: [kept], slots: 1 });
});

it("deletes a poll once a day while the server runs", async () => {
  const expired = await pollOn(["2026-10-17"]);

  vi.setSystemTime(new Date("2026-12-16T14:00:00Z"));
  await cleanup();

  expect(remaining().polls).toEqual([expired]);

  vi.advanceTimersByTime(day);

  expect(remaining()).toEqual({ polls: [], participants: [], slots: 0 });
});

it("never deletes a poll its own zone still shows", async () => {
  const western = await pollOn(["2026-10-16"], "Pacific/Pago_Pago");

  vi.setSystemTime(new Date("2026-12-16T05:00:00Z"));
  await cleanup();

  expect(remaining().polls).toEqual([western]);
});
