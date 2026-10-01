import { participants, polls } from "@/shared/db/schema";
import { fakeCookies } from "@/shared/testing/fake-cookies";
import { loggedLines } from "@/shared/testing/logged-lines";
import { openTestDatabase } from "@/shared/testing/test-database";
import { hashToken } from "@/shared/token-cookie";
import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let cookieJar = fakeCookies();
let requestHeaders = new Headers();

vi.mock("next/headers", () => ({ cookies: async () => cookieJar, headers: async () => requestHeaders }));

const thursdayNoonInWarsaw = new Date("2026-10-15T10:00:00Z");
const pollId = "Planszowki";

let db: Awaited<ReturnType<typeof openTestDatabase>>;

async function actions() {
  return import("./answer-actions");
}

async function myAnswer() {
  const { findMyAnswer } = await import("./answer-queries");

  return findMyAnswer(pollId);
}

function onAnotherDevice() {
  cookieJar = fakeCookies();
}

function withParticipants(howMany: number) {
  db.insert(participants)
    .values(
      Array.from({ length: howMany }, (_, friend) => ({
        pollId,
        name: `Osoba ${friend + 1}`,
        normalisedName: `osoba ${friend + 1}`,
        tokenHash: hashToken(`osoba-${friend + 1}`),
        createdAt: thursdayNoonInWarsaw,
        updatedAt: thursdayNoonInWarsaw,
      })),
    )
    .run();
}

const organiserToken = "organiser-token";

function onOrganiserDevice() {
  cookieJar = fakeCookies();
  cookieJar.set(`${pollId}-org`, organiserToken);
}

beforeEach(async () => {
  cookieJar = fakeCookies();
  requestHeaders = new Headers();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(thursdayNoonInWarsaw);
  db = await openTestDatabase();

  db.insert(polls)
    .values({
      id: pollId,
      title: "Planszówki u Michała",
      organiserName: "Kuba",
      dates: ["2026-10-16", "2026-10-17"],
      lastDate: "2026-10-17",
      firstHour: 17,
      hourCount: 6,
      timeZone: "Europe/Warsaw",
      organiserTokenHash: hashToken(organiserToken),
      createdByParticipant: false,
      createdAt: thursdayNoonInWarsaw,
    })
    .run();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

const friday19 = { date: "2026-10-16", hour: 19 };
const friday20 = { date: "2026-10-16", hour: 20 };
const saturday17 = { date: "2026-10-17", hour: 17 };

describe("saveAnswer", () => {
  it("creates the participant on the first save and resumes it from the cookie", async () => {
    const { saveAnswer } = await actions();

    const result = await saveAnswer(pollId, { name: "  Ola  ", slots: [friday19, friday20] });

    expect(result).toEqual({ ok: true });
    expect(await myAnswer()).toEqual({ name: "Ola", slots: [friday19, friday20] });
  });

  it("gives the participant a one-year httpOnly cookie named after the poll", async () => {
    const { saveAnswer } = await actions();

    await saveAnswer(pollId, { name: "Ola", slots: [] });

    expect(cookieJar.get(pollId)).toEqual({
      name: pollId,
      value: expect.stringMatching(/^[A-Za-z0-9_-]{43}$/),
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 31_536_000,
      secure: false,
    });
  });

  it("marks the participant cookie Secure on a request that arrived over https", async () => {
    requestHeaders = new Headers({ "x-forwarded-proto": "https" });
    const { saveAnswer } = await actions();

    await saveAnswer(pollId, { name: "Ola", slots: [] });

    expect(cookieJar.get(pollId)).toMatchObject({ secure: true });
  });

  it("leaves Secure off a cookie set over plain http, so a browser on http://localhost keeps it", async () => {
    requestHeaders = new Headers({ "x-forwarded-proto": "http" });
    const { saveAnswer } = await actions();

    await saveAnswer(pollId, { name: "Ola", slots: [] });

    expect(cookieJar.get(pollId)).toMatchObject({ secure: false });
  });

  it("saves an empty set for someone who can't make any time", async () => {
    const { saveAnswer } = await actions();

    await saveAnswer(pollId, { name: "Ola", slots: [friday19] });

    const result = await saveAnswer(pollId, { name: "Ola", slots: [] });

    expect(result).toEqual({ ok: true });
    expect(await myAnswer()).toEqual({ name: "Ola", slots: [] });
  });

  it("replaces the slots and renames the row on later saves", async () => {
    const { saveAnswer } = await actions();

    await saveAnswer(pollId, { name: "Ola", slots: [friday19, friday20] });

    await saveAnswer(pollId, { name: "Ola Nowak", slots: [saturday17] });

    expect(await myAnswer()).toEqual({ name: "Ola Nowak", slots: [saturday17] });
  });

  it("refuses an empty name, a name over 30 characters and a slot outside the poll", async () => {
    const { saveAnswer } = await actions();

    expect(await saveAnswer(pollId, { name: "   ", slots: [] })).toEqual({ ok: false, reason: "invalid" });
    expect(await saveAnswer(pollId, { name: "a".repeat(31), slots: [] })).toEqual({ ok: false, reason: "invalid" });
    expect(await saveAnswer(pollId, { name: "Ola", slots: [{ date: "2026-10-16", hour: 23 }] })).toEqual({ ok: false, reason: "invalid" });
    expect(await saveAnswer(pollId, { name: "Ola", slots: [{ date: "2026-10-18", hour: 19 }] })).toEqual({ ok: false, reason: "invalid" });
    expect(await saveAnswer(pollId, { name: "Ola", slots: [friday19, friday19] })).toEqual({ ok: false, reason: "invalid" });
    expect(await myAnswer()).toBeUndefined();
  });

  it("keeps an hour past midnight under the evening's date", async () => {
    db.update(polls).set({ firstHour: 22, hourCount: 6 }).run();
    const { saveAnswer } = await actions();
    const fridayOneAm = { date: "2026-10-16", hour: 25 };

    expect(await saveAnswer(pollId, { name: "Ola", slots: [{ date: "2026-10-16", hour: 28 }] })).toEqual({ ok: false, reason: "invalid" });
    await saveAnswer(pollId, { name: "Ola", slots: [fridayOneAm] });

    expect(await myAnswer()).toEqual({ name: "Ola", slots: [fridayOneAm] });
  });

  it("writes one answer_saved line per save, new or changed, without the name", async () => {
    const { saveAnswer } = await actions();
    const lines = loggedLines("log");

    await saveAnswer(pollId, { name: "Ola", slots: [friday19] });
    await saveAnswer(pollId, { name: "Ola Nowak", slots: [] });

    expect(lines().map((line) => JSON.parse(line))).toEqual([
      { level: "info", message: "answer_saved", pollId },
      { level: "info", message: "answer_saved", pollId },
    ]);
  });

  it("writes nothing for a refused save", async () => {
    const { saveAnswer } = await actions();

    await saveAnswer(pollId, { name: "Łucja", slots: [friday19] });
    onAnotherDevice();
    const lines = loggedLines("log");

    await saveAnswer(pollId, { name: "Łucja", slots: [saturday17] });

    expect(lines()).toEqual([]);
  });

  it("tells a newcomer that a name already in the poll is taken, ignoring case", async () => {
    const { saveAnswer } = await actions();

    await saveAnswer(pollId, { name: "Łucja", slots: [friday19] });
    onAnotherDevice();

    const result = await saveAnswer(pollId, { name: "ŁUCJA", slots: [saturday17] });

    expect(result).toEqual({ ok: false, reason: "name-taken", name: "Łucja", hours: 1 });
    expect(await myAnswer()).toBeUndefined();
  });

  it("refuses a rename onto someone else's name", async () => {
    const { saveAnswer } = await actions();

    await saveAnswer(pollId, { name: "Ola", slots: [] });
    onAnotherDevice();
    await saveAnswer(pollId, { name: "Bartek", slots: [friday19] });

    const result = await saveAnswer(pollId, { name: "ola", slots: [friday19] });

    expect(result).toEqual({ ok: false, reason: "name-taken", name: "Ola", hours: 0, yours: { name: "Bartek", hours: 1 } });
    expect(await myAnswer()).toEqual({ name: "Bartek", slots: [friday19] });
  });

  it("says not-yours and forgets the device once another device took its row over", async () => {
    const { saveAnswer, claimName } = await actions();

    await saveAnswer(pollId, { name: "Ola", slots: [friday19] });
    const firstDevice = cookieJar;

    onAnotherDevice();
    await claimName(pollId, { name: "Ola", slots: [] });
    cookieJar = firstDevice;

    const result = await saveAnswer(pollId, { name: "Ola", slots: [saturday17] });

    expect(result).toEqual({ ok: false, reason: "not-yours" });
    expect(cookieJar.get(pollId)).toBeUndefined();
  });

  it("keeps the organiser's name for the organiser's devices", async () => {
    const { saveAnswer } = await actions();

    expect(await saveAnswer(pollId, { name: "kuba", slots: [friday19] })).toEqual({ ok: false, reason: "organiser-name" });
    onOrganiserDevice();
    expect(await saveAnswer(pollId, { name: "Kuba", slots: [friday19] })).toEqual({ ok: true });
  });

  it("refuses answers once the final time is set", async () => {
    const { saveAnswer } = await actions();

    db.update(polls).set({ finalDate: "2026-10-16", finalFirstHour: 19, finalLastHour: 22 }).where(eq(polls.id, pollId)).run();

    expect(await saveAnswer(pollId, { name: "Ola", slots: [friday19] })).toEqual({ ok: false, reason: "closed" });
  });

  it("accepts a 30th participant and refuses a 31st", async () => {
    const { saveAnswer } = await actions();

    withParticipants(29);

    onAnotherDevice();

    expect(await saveAnswer(pollId, { name: "Ola", slots: [friday19] })).toEqual({ ok: true });

    onAnotherDevice();

    expect(await saveAnswer(pollId, { name: "Bartek", slots: [friday19] })).toEqual({ ok: false, reason: "full" });
  });

  it("lets only one of two newcomers saving at once take the 30th place", async () => {
    const { saveAnswer } = await actions();

    withParticipants(29);

    onAnotherDevice();
    const olaSaves = saveAnswer(pollId, { name: "Ola", slots: [friday19] });

    onAnotherDevice();
    const bartekSaves = saveAnswer(pollId, { name: "Bartek", slots: [friday19] });

    const results = await Promise.all([olaSaves, bartekSaves]);

    expect(results).toContainEqual({ ok: false, reason: "full" });
    expect(results).toContainEqual({ ok: true });
    expect(db.select().from(participants).where(eq(participants.pollId, pollId)).all()).toHaveLength(30);
  });

  it("says gone for a deleted, expired or malformed poll", async () => {
    const { saveAnswer } = await actions();

    expect(await saveAnswer("abcdefghij", { name: "Ola", slots: [] })).toEqual({ ok: false, reason: "gone" });
    expect(await saveAnswer("../etc", { name: "Ola", slots: [] })).toEqual({ ok: false, reason: "gone" });
    vi.setSystemTime(new Date("2026-12-17T10:00:00Z"));
    expect(await saveAnswer(pollId, { name: "Ola", slots: [] })).toEqual({ ok: false, reason: "gone" });
  });
});

describe("claimName", () => {
  it("moves the row to this device and hands back its slots", async () => {
    const { saveAnswer, claimName } = await actions();

    await saveAnswer(pollId, { name: "Ola", slots: [friday19] });
    onAnotherDevice();

    const result = await claimName(pollId, { name: " ola ", slots: [] });

    expect(result).toEqual({ ok: true, name: "Ola", slots: [friday19] });
    expect(await myAnswer()).toEqual({ name: "Ola", slots: [friday19] });
  });

  it("retires the row this device held, so one person never counts twice", async () => {
    const { saveAnswer, claimName } = await actions();

    await saveAnswer(pollId, { name: "Ola", slots: [friday19] });
    onAnotherDevice();
    await saveAnswer(pollId, { name: "O", slots: [saturday17] });

    await claimName(pollId, { name: "Ola", slots: [saturday17] });

    expect(db.select({ name: participants.name }).from(participants).all()).toEqual([{ name: "Ola" }]);
  });

  it("folds the hours this device answered into the claimed row", async () => {
    const { saveAnswer, claimName } = await actions();

    await saveAnswer(pollId, { name: "Ola", slots: [friday19, saturday17] });
    onAnotherDevice();
    await saveAnswer(pollId, { name: "Bartek", slots: [friday19, friday20] });

    const result = await claimName(pollId, { name: "Ola", slots: [friday19, friday20] });

    expect(result).toEqual({ ok: true, name: "Ola", slots: [friday19, friday20, saturday17] });
    expect(await myAnswer()).toEqual({ name: "Ola", slots: [friday19, friday20, saturday17] });
  });

  it("folds only the hours still on this device's grid, not one turned off since the last save", async () => {
    const { saveAnswer, claimName } = await actions();

    await saveAnswer(pollId, { name: "Ola", slots: [saturday17] });
    onAnotherDevice();
    await saveAnswer(pollId, { name: "Bartek", slots: [friday19, friday20] });

    const result = await claimName(pollId, { name: "Ola", slots: [friday19] });

    expect(result).toEqual({ ok: true, name: "Ola", slots: [friday19, saturday17] });
    expect(await myAnswer()).toEqual({ name: "Ola", slots: [friday19, saturday17] });
  });

  it("refuses the organiser's name and changes no row", async () => {
    const { saveAnswer, claimName } = await actions();

    onOrganiserDevice();
    await saveAnswer(pollId, { name: "Kuba", slots: [friday19] });
    const rowsBefore = db.select().from(participants).all();

    onAnotherDevice();

    const result = await claimName(pollId, { name: " kuba ", slots: [] });

    expect(result).toEqual({ ok: false, reason: "organiser-name" });
    expect(db.select().from(participants).all()).toEqual(rowsBefore);
    expect(cookieJar.get(pollId)).toBeUndefined();
  });

  it("lets the organiser move their own row to a second device", async () => {
    const { saveAnswer, claimName } = await actions();

    onOrganiserDevice();
    await saveAnswer(pollId, { name: "Kuba", slots: [friday19] });
    onOrganiserDevice();

    expect(await claimName(pollId, { name: "Kuba", slots: [] })).toEqual({ ok: true, name: "Kuba", slots: [friday19] });
  });

  it("refuses a name nobody in the poll has", async () => {
    const { claimName } = await actions();

    expect(await claimName(pollId, { name: "Ola", slots: [] })).toEqual({ ok: false, reason: "invalid" });
  });

  it("refuses an hour outside the poll and changes no row", async () => {
    const { saveAnswer, claimName } = await actions();

    await saveAnswer(pollId, { name: "Ola", slots: [friday19] });
    onAnotherDevice();
    await saveAnswer(pollId, { name: "Bartek", slots: [friday20] });
    const rowsBefore = db.select().from(participants).all();

    const result = await claimName(pollId, { name: "Ola", slots: [{ date: "2026-10-18", hour: 19 }] });

    expect(result).toEqual({ ok: false, reason: "invalid" });
    expect(db.select().from(participants).all()).toEqual(rowsBefore);
  });

  it("refuses once the final time is set, and for a gone poll", async () => {
    const { saveAnswer, claimName } = await actions();

    await saveAnswer(pollId, { name: "Ola", slots: [] });
    onAnotherDevice();
    db.update(polls).set({ finalDate: "2026-10-16", finalFirstHour: 19, finalLastHour: 22 }).where(eq(polls.id, pollId)).run();

    expect(await claimName(pollId, { name: "Ola", slots: [] })).toEqual({ ok: false, reason: "closed" });
    expect(await claimName("abcdefghij", { name: "Ola", slots: [] })).toEqual({ ok: false, reason: "gone" });
  });
});
