import { participants } from "@/shared/db/schema";
import { fakeCookies } from "@/shared/testing/fake-cookies";
import { openTestDatabase } from "@/shared/testing/test-database";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cookieJar = fakeCookies();

vi.mock("next/headers", () => ({ cookies: async () => cookieJar, headers: async () => new Headers() }));

const thursdayNoonInWarsaw = new Date("2026-10-15T10:00:00Z");

let db: Awaited<ReturnType<typeof openTestDatabase>>;

async function pollOf(title: string, dates: string[]) {
  const { createPoll } = await import("./create-poll-action");
  const created = await createPoll({ title, dates, firstHour: 17, hourCount: 6, timeZone: "Europe/Warsaw", organiserName: "Kuba" });

  return created.ok ? created.id : "";
}

async function answer(pollId: string, name: string) {
  await db
    .insert(participants)
    .values({ pollId, name, normalisedName: name, tokenHash: name, createdAt: new Date(), updatedAt: new Date() });
}

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(thursdayNoonInWarsaw);
  db = await openTestDatabase();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe("findPolls", () => {
  it("tells each poll's title, dates, answer count and set time, in the order asked", async () => {
    const kino = await pollOf("Kino", ["2026-10-17", "2026-10-18"]);
    const grill = await pollOf("Grill", ["2026-10-24"]);
    const { setFinal } = await import("./organiser-actions");
    const { findPolls } = await import("./find-polls-action");

    await answer(grill, "Ola");
    await answer(grill, "Bartek");
    await setFinal(kino, { date: "2026-10-17", firstHour: 19, lastHour: 22 });

    expect(await findPolls([grill, kino])).toEqual({
      ok: true,
      polls: [
        { id: grill, title: "Grill", dates: ["2026-10-24"], respondentCount: 2, final: null },
        {
          id: kino,
          title: "Kino",
          dates: ["2026-10-17", "2026-10-18"],
          respondentCount: 0,
          final: { date: "2026-10-17", firstHour: 19, lastHour: 22 },
        },
      ],
    });
  });

  it("leaves out a poll the server no longer has", async () => {
    const kino = await pollOf("Kino", ["2026-10-17"]);
    const grill = await pollOf("Grill", ["2026-10-24"]);
    const { deletePoll } = await import("./organiser-actions");
    const { findPolls } = await import("./find-polls-action");

    await deletePoll(kino);

    expect(await findPolls([kino, grill, "not-a-poll"])).toMatchObject({ ok: true, polls: [{ id: grill }] });
  });

  it("leaves out a poll 61 days past its last date", async () => {
    const kino = await pollOf("Kino", ["2026-10-17"]);
    const { findPolls } = await import("./find-polls-action");

    vi.setSystemTime(new Date("2026-12-17T10:00:00Z"));

    expect(await findPolls([kino])).toEqual({ ok: true, polls: [] });
  });

  it("refuses anything but a short list of poll ids", async () => {
    const { findPolls } = await import("./find-polls-action");

    expect(await findPolls("Kino" as unknown as string[])).toEqual({ ok: false, reason: "invalid" });
    expect(await findPolls(Array.from({ length: 101 }, () => "abcdefghij"))).toEqual({ ok: false, reason: "invalid" });
  });
});
