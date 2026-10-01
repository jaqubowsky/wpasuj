import { openTestDatabase } from "@/shared/testing/test-database";
import { eq } from "drizzle-orm";
import { afterEach, expect, it, vi } from "vitest";
import { participants, polls, slots } from "./schema";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

it("can be imported where no database is configured, as during the build", async () => {
  vi.stubEnv("DATABASE_PATH", "");

  await expect(import("./client")).resolves.toBeDefined();
});

it("opens the database file in WAL mode", async () => {
  const db = await openTestDatabase();

  expect(db.$client.pragma("journal_mode", { simple: true })).toBe("wal");
});

it("deletes a poll's answers with the poll", async () => {
  const db = await openTestDatabase();

  const poll = {
    title: "Kino",
    organiserName: "Kuba",
    dates: ["2026-10-17"],
    lastDate: "2026-10-17",
    firstHour: 17,
    hourCount: 6,
    timeZone: "Europe/Warsaw",
    organiserTokenHash: "organiser",
    createdByParticipant: false,
    createdAt: new Date(0),
  };

  db.insert(polls)
    .values([
      { id: "kino000001", ...poll },
      { id: "kino000002", ...poll },
    ])
    .run();

  const answer = { name: "Ola", normalisedName: "ola", createdAt: new Date(0), updatedAt: new Date(0) };

  const [deleted, kept] = db
    .insert(participants)
    .values([
      { pollId: "kino000001", tokenHash: "first", ...answer },
      { pollId: "kino000002", tokenHash: "second", ...answer },
    ])
    .returning({ id: participants.id })
    .all();

  db.insert(slots)
    .values([
      { participantId: deleted.id, date: "2026-10-17", hour: 18 },
      { participantId: kept.id, date: "2026-10-17", hour: 18 },
    ])
    .run();

  db.delete(polls).where(eq(polls.id, "kino000001")).run();

  expect(db.select({ id: participants.id }).from(participants).all()).toEqual([{ id: kept.id }]);
  expect(db.select({ participantId: slots.participantId }).from(slots).all()).toEqual([{ participantId: kept.id }]);
});
