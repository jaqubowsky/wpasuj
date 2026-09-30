import { expect, it } from "vitest";
import { issueDescription, issueTitle } from "./report-issue";

const report = {
  text: "Siatka się nie przewija\nna iPhonie",
  contact: "",
  path: "/",
  userAgent: "",
  viewport: { width: 1440, height: 900 },
  time: new Date("2026-09-30T08:15:00Z"),
};

it("titles an issue with the first line of the text", () => {
  expect(issueTitle("\n  Siatka się nie przewija  \nna iPhonie")).toBe("Siatka się nie przewija");
});

it("describes a report from the landing without a poll or a contact", () => {
  expect(issueDescription(report)).toBe(
    [
      "Filed from the in-app “Zgłoś problem” form.",
      "",
      "Siatka się nie przewija",
      "na iPhonie",
      "",
      "**Contact:** none",
      "",
      "- Path: `/`",
      "- User agent: unknown",
      "- Viewport: 1440×900",
      "- Time: 2026-09-30T08:15:00.000Z",
    ].join("\n"),
  );
});

it("names the poll a report came from", () => {
  expect(issueDescription({ ...report, path: "/e/Ab3_x-9Qz0" })).toContain("- Poll: `Ab3_x-9Qz0`");
});
