import { polls } from "@/shared/db/schema";
import { fakeCookies } from "@/shared/testing/fake-cookies";
import { openTestDatabase } from "@/shared/testing/test-database";
import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let cookieJar = fakeCookies();
vi.mock("next/headers", () => ({ cookies: async () => cookieJar }));

let db: Awaited<ReturnType<typeof openTestDatabase>>;
let pollId: string;

const saturdayEvening = { date: "2026-10-17", firstHour: 19, lastHour: 22 };

beforeEach(async () => {
  cookieJar = fakeCookies();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-10-15T10:00:00Z"));
  db = await openTestDatabase();
  const { createPoll } = await import("./create-poll-action");
  const result = await createPoll({
    title: "Kino",
    dates: ["2026-10-16", "2026-10-17"],
    firstHour: 17,
    lastHour: 23,
    timeZone: "Europe/Warsaw",
    organiserName: "Kuba",
  });
  pollId = result.ok ? result.id : "";
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

function asStranger() {
  cookieJar = fakeCookies();
}

async function finalOf(id: string) {
  const [row] = await db
    .select({ date: polls.finalDate, firstHour: polls.finalFirstHour, lastHour: polls.finalLastHour })
    .from(polls)
    .where(eq(polls.id, id));
  return row;
}

describe("setFinal", () => {
  it("fixes the time for the organiser", async () => {
    const { setFinal } = await import("./organiser-actions");

    expect(await setFinal(pollId, saturdayEvening)).toEqual({ ok: true });
    expect(await finalOf(pollId)).toEqual(saturdayEvening);
  });

  it("refuses someone without the organiser cookie", async () => {
    const { setFinal } = await import("./organiser-actions");
    asStranger();

    expect(await setFinal(pollId, saturdayEvening)).toEqual({ ok: false, reason: "not-organiser" });
    expect(await finalOf(pollId)).toEqual({ date: null, firstHour: null, lastHour: null });
  });

  it("answers gone for a poll that does not exist", async () => {
    const { setFinal } = await import("./organiser-actions");

    expect(await setFinal("abcdefghij", saturdayEvening)).toEqual({ ok: false, reason: "gone" });
  });

  it.each([
    ["a date the poll does not offer", { ...saturdayEvening, date: "2026-10-18" }],
    ["hours outside the poll's range", { ...saturdayEvening, lastHour: 24 }],
    ["an end before the start", { ...saturdayEvening, firstHour: 21, lastHour: 21 }],
  ])("refuses %s as invalid", async (_, final) => {
    const { setFinal } = await import("./organiser-actions");

    expect(await setFinal(pollId, final)).toEqual({ ok: false, reason: "invalid" });
  });
});

describe("a poll 60 days past its last date", () => {
  it("is gone for the organiser too", async () => {
    const { deletePoll, setFinal } = await import("./organiser-actions");
    vi.setSystemTime(new Date("2026-12-17T10:00:00Z"));

    expect(await setFinal(pollId, saturdayEvening)).toEqual({ ok: false, reason: "gone" });
    expect(await deletePoll(pollId)).toEqual({ ok: false, reason: "gone" });
  });
});

describe("deletePoll", () => {
  it("deletes the poll for the organiser", async () => {
    const { deletePoll } = await import("./organiser-actions");
    const { findPoll } = await import("./poll-queries");

    expect(await deletePoll(pollId)).toEqual({ ok: true });
    expect(findPoll(pollId, new Date())).toBeUndefined();
  });

  it("refuses someone without the organiser cookie", async () => {
    const { deletePoll } = await import("./organiser-actions");
    const { findPoll } = await import("./poll-queries");
    asStranger();

    expect(await deletePoll(pollId)).toEqual({ ok: false, reason: "not-organiser" });
    expect(findPoll(pollId, new Date())).toBeDefined();
  });

  it("answers gone for a poll that does not exist", async () => {
    const { deletePoll } = await import("./organiser-actions");

    expect(await deletePoll("abcdefghij")).toEqual({ ok: false, reason: "gone" });
  });
});
