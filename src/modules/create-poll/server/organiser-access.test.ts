import { fakeCookies } from "@/shared/testing/fake-cookies";
import { openTestDatabase } from "@/shared/testing/test-database";
import { beforeEach, describe, expect, it, vi } from "vitest";

let cookieJar = fakeCookies();
vi.mock("next/headers", () => ({ cookies: async () => cookieJar }));

let pollId: string;
let organiserCookie: string;

beforeEach(async () => {
  cookieJar = fakeCookies();
  await openTestDatabase();
  const { createPoll } = await import("./create-poll-action");
  const result = await createPoll({
    title: "Kino",
    dates: ["2030-10-16"],
    firstHour: 17,
    hourCount: 6,
    timeZone: "Europe/Warsaw",
    organiserName: "Kuba",
  });
  pollId = result.ok ? result.id : "";
  organiserCookie = cookieJar.get(`${pollId}-org`)?.value ?? "";
});

function onAnotherDevice() {
  cookieJar = fakeCookies();
}

describe("organiserToken", () => {
  it("is the organiser's token on the device that created the poll", async () => {
    const { organiserToken } = await import("./organiser-access");

    expect(await organiserToken(pollId)).toBe(organiserCookie);
  });

  it("is missing on another device", async () => {
    const { organiserToken } = await import("./organiser-access");
    onAnotherDevice();

    expect(await organiserToken(pollId)).toBeUndefined();
  });

  it("is missing for a cookie that does not match the poll", async () => {
    const { organiserToken } = await import("./organiser-access");
    onAnotherDevice();
    cookieJar.set(`${pollId}-org`, "not-the-token");

    expect(await organiserToken(pollId)).toBeUndefined();
  });
});

describe("grantOrganiser", () => {
  it("makes another device the organiser with the organiser's token", async () => {
    const { grantOrganiser, organiserToken } = await import("./organiser-access");
    onAnotherDevice();

    await grantOrganiser(pollId, organiserCookie);

    expect(await organiserToken(pollId)).toBe(organiserCookie);
    expect(cookieJar.get(`${pollId}-org`)).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/" });
  });

  it("gives nothing for a wrong token", async () => {
    const { grantOrganiser } = await import("./organiser-access");
    onAnotherDevice();

    await grantOrganiser(pollId, "not-the-token");

    expect(cookieJar.getAll()).toEqual([]);
  });

  it("gives nothing for a poll that does not exist", async () => {
    const { grantOrganiser } = await import("./organiser-access");
    onAnotherDevice();

    await grantOrganiser("abcdefghij", organiserCookie);

    expect(cookieJar.getAll()).toEqual([]);
  });
});
