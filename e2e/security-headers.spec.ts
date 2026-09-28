import { expect, test } from "@playwright/test";
import { seedPoll } from "./seed";

const pollId = () => seedPoll({ dates: ["2030-10-17"], firstHour: 19, hourCount: 3, final: { date: "2030-10-17", firstHour: 19, lastHour: 21 } });

for (const [what, path] of [
  ["the create page", () => "/"],
  ["a poll page", () => `/e/${pollId()}`],
  ["the read endpoint", () => `/api/polls/${pollId()}`],
  ["the calendar file", () => `/e/${pollId()}/termin.ics`],
  ["the organiser link", () => `/e/${pollId()}/organizator/not-the-token`],
] as const) {
  test(`${what} refuses frames, keeps its URL on this site and names no framework`, async ({ request }) => {
    const response = await request.get(path(), { maxRedirects: 0 });

    expect(response.headers()).toMatchObject({
      "x-frame-options": "DENY",
      "content-security-policy": "frame-ancestors 'none'",
      "referrer-policy": "same-origin",
      "x-content-type-options": "nosniff",
    });
    expect(response.headers()).not.toHaveProperty("x-powered-by");
  });
}
