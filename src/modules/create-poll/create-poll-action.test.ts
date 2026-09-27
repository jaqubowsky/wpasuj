import { participants, polls } from "@/shared/db/schema";
import { fakeCookies } from "@/shared/testing/fake-cookies";
import { openTestDatabase } from "@/shared/testing/test-database";
import { hashToken } from "@/shared/token-cookie";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let cookieJar = fakeCookies();
vi.mock("next/headers", () => ({ cookies: async () => cookieJar }));

const thursdayNoonInWarsaw = new Date("2026-10-15T10:00:00Z");

const input = {
  title: "  Planszówki u Michała ",
  dates: ["2026-10-17", "2026-10-16", "2026-10-18"],
  firstHour: 17,
  lastHour: 23,
  timeZone: "Europe/Warsaw",
  organiserName: "  Kuba   Nowak ",
};

let db: Awaited<ReturnType<typeof openTestDatabase>>;

async function actions() {
  return import("./create-poll-action");
}

async function queries() {
  return import("./poll-queries");
}

beforeEach(async () => {
  cookieJar = fakeCookies();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(thursdayNoonInWarsaw);
  db = await openTestDatabase();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe("createPoll", () => {
  it("creates the poll the organiser lands on", async () => {
    const { createPoll } = await actions();

    const result = await createPoll(input);

    expect(result).toEqual({ ok: true, id: expect.stringMatching(/^[A-Za-z0-9_-]{10}$/) });
    const { findPoll } = await queries();
    expect(findPoll(result.ok ? result.id : "", new Date())).toEqual({
      title: "Planszówki u Michała",
      organiserName: "Kuba Nowak",
      dates: ["2026-10-16", "2026-10-17", "2026-10-18"],
      firstHour: 17,
      lastHour: 23,
      timeZone: "Europe/Warsaw",
      respondentCount: 0,
      final: null,
    });
  });

  it("gives the organiser a one-year httpOnly cookie named after the poll", async () => {
    const { createPoll } = await actions();

    const result = await createPoll(input);

    const id = result.ok ? result.id : "";
    expect(cookieJar.get(`${id}-org`)).toEqual({
      name: `${id}-org`,
      value: expect.stringMatching(/^[A-Za-z0-9_-]{43}$/),
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 31_536_000,
    });
    const [row] = await db.select().from(polls);
    expect(row.organiserTokenHash).toBe(hashToken(cookieJar.get(`${id}-org`)!.value));
  });

  it("records whether the organiser already answered another poll", async () => {
    const { createPoll } = await actions();
    const first = await createPoll(input);
    const firstId = first.ok ? first.id : "";
    const now = new Date();
    await db.insert(participants).values({
      pollId: firstId,
      name: "Ola",
      normalisedName: "ola",
      tokenHash: hashToken("participant-token"),
      createdAt: now,
      updatedAt: now,
    });
    cookieJar = fakeCookies();
    cookieJar.set("someone-else", "not-a-token");

    const stranger = await createPoll(input);
    cookieJar.set(firstId, "participant-token");
    const participant = await createPoll(input);

    const rows = await db.select().from(polls);
    const created = (id: string) => rows.find((row) => row.id === id)?.createdByParticipant;
    expect(created(firstId)).toBe(false);
    expect(created(stranger.ok ? stranger.id : "")).toBe(false);
    expect(created(participant.ok ? participant.id : "")).toBe(true);
  });

  it("removes polls 60 days past their last date before it inserts", async () => {
    const { createPoll } = await actions();
    const old = await createPoll({ ...input, dates: ["2026-10-15"] });
    const recent = await createPoll({ ...input, dates: ["2026-10-16"] });

    vi.setSystemTime(new Date("2026-12-16T10:00:00Z"));
    await createPoll({ ...input, dates: ["2026-12-16"] });

    const ids = (await db.select({ id: polls.id }).from(polls)).map((row) => row.id);
    expect(ids).not.toContain(old.ok ? old.id : "");
    expect(ids).toContain(recent.ok ? recent.id : "");
    expect(ids).toHaveLength(2);
  });

  it("never removes a poll its own zone still shows", async () => {
    const { createPoll } = await actions();
    const { findPoll } = await queries();
    const western = await createPoll({ ...input, dates: ["2026-10-16"], timeZone: "Pacific/Pago_Pago" });
    const id = western.ok ? western.id : "";

    vi.setSystemTime(new Date("2026-12-16T05:00:00Z"));
    await createPoll({ ...input, dates: ["2026-12-16"] });

    expect(findPoll(id, new Date())).toBeDefined();
  });

  it.each([
    ["an empty title", { title: "   " }],
    ["a title over 60 characters", { title: "x".repeat(61) }],
    ["no dates", { dates: [] }],
    ["more than 10 dates", { dates: Array.from({ length: 11 }, (_, day) => `2026-10-${16 + day}`) }],
    ["the same date twice", { dates: ["2026-10-16", "2026-10-16"] }],
    ["a date that is not a date", { dates: ["2026-02-30"] }],
    ["a date in the past of the poll's zone", { dates: ["2026-10-14", "2026-10-16"] }],
    ["an end before the start", { firstHour: 20, lastHour: 20 }],
    ["an hour outside 0 to 24", { firstHour: 17, lastHour: 25 }],
    ["an unknown time zone", { timeZone: "Mars/Olympus" }],
    ["an empty name", { organiserName: "  " }],
    ["a name over 30 characters", { organiserName: "x".repeat(31) }],
  ])("refuses %s as invalid", async (_, change) => {
    const { createPoll } = await actions();

    const result = await createPoll({ ...input, ...change });

    expect(result).toEqual({ ok: false, reason: "invalid" });
    expect(await db.select().from(polls)).toHaveLength(0);
  });

  it("accepts today in the poll's zone when the server's UTC date is still yesterday", async () => {
    vi.setSystemTime(new Date("2026-10-15T22:30:00Z"));
    const { createPoll } = await actions();

    const result = await createPoll({ ...input, dates: ["2026-10-16"] });

    expect(result.ok).toBe(true);
  });
});

describe("findPoll", () => {
  it("finds nothing for an unknown id", async () => {
    const { findPoll } = await queries();

    expect(findPoll("abcdefghij", new Date())).toBeUndefined();
  });

  it("finds nothing for an id that is not a poll id", async () => {
    const { findPoll } = await queries();

    expect(findPoll("../../etc", new Date())).toBeUndefined();
  });

  it("finds nothing once the poll is 60 days past its last date", async () => {
    const { createPoll } = await actions();
    const { findPoll } = await queries();
    const result = await createPoll({ ...input, dates: ["2026-10-16"] });
    const id = result.ok ? result.id : "";

    expect(findPoll(id, new Date("2026-12-15T10:00:00Z"))).toBeDefined();
    expect(findPoll(id, new Date("2026-12-16T10:00:00Z"))).toBeUndefined();
  });

  it("counts who answered", async () => {
    const { createPoll } = await actions();
    const { findPoll } = await queries();
    const result = await createPoll(input);
    const id = result.ok ? result.id : "";
    const now = new Date();
    await db.insert(participants).values(
      ["Ola", "Bartek"].map((name) => ({
        pollId: id,
        name,
        normalisedName: name.toLowerCase(),
        tokenHash: hashToken(name),
        createdAt: now,
        updatedAt: now,
      })),
    );

    expect(findPoll(id, now)?.respondentCount).toBe(2);
  });
});
