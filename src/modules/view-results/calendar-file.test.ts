import { describe, expect, it } from "vitest";
import { calendarFile } from "./calendar-file";

const poll = { id: "abcdefghij", title: "Planszówki, u Michała", timeZone: "Europe/Warsaw" };
const now = new Date("2026-10-20T12:00:00Z");

function linesOf(file: string) {
  return file.split("\r\n");
}

describe("calendarFile", () => {
  it("writes a summer-time evening in UTC", () => {
    const lines = linesOf(calendarFile({ ...poll, final: { date: "2026-10-24", firstHour: 19, lastHour: 22 } }, now));

    expect(lines).toContain("DTSTART:20261024T170000Z");
    expect(lines).toContain("DTEND:20261024T200000Z");
  });

  it("writes a winter-time evening ending at midnight in UTC", () => {
    const lines = linesOf(calendarFile({ ...poll, final: { date: "2026-10-31", firstHour: 19, lastHour: 24 } }, now));

    expect(lines).toContain("DTSTART:20261031T180000Z");
    expect(lines).toContain("DTEND:20261031T230000Z");
  });

  it("keeps the wall-clock hours across the night the clocks go back", () => {
    const lines = linesOf(calendarFile({ ...poll, final: { date: "2026-10-25", firstHour: 1, lastHour: 4 } }, now));

    expect(lines).toContain("DTSTART:20261024T230000Z");
    expect(lines).toContain("DTEND:20261025T030000Z");
  });

  it("is one event named by the poll's title", () => {
    const lines = linesOf(calendarFile({ ...poll, final: { date: "2026-10-24", firstHour: 19, lastHour: 22 } }, now));

    expect(lines.slice(0, 2)).toEqual(["BEGIN:VCALENDAR", "VERSION:2.0"]);
    expect(lines).toContain("SUMMARY:Planszówki\\, u Michała");
    expect(lines).toContain("DTSTAMP:20261020T120000Z");
    expect(lines.filter((line) => line === "BEGIN:VEVENT")).toHaveLength(1);
    expect(lines.at(-2)).toBe("END:VCALENDAR");
  });

  it("folds a long Polish title into lines of at most 75 octets", () => {
    const title = "Zażółć gęślą jaźń, żeby każdy łączył się ze śpiewającą grupą";
    const file = calendarFile({ ...poll, title, final: { date: "2026-10-24", firstHour: 19, lastHour: 22 } }, now);

    expect(linesOf(file).every((line) => new TextEncoder().encode(line).length <= 75)).toBe(true);
    expect(linesOf(file.replaceAll("\r\n ", ""))).toContain(`SUMMARY:${title.replace(",", "\\,")}`);
  });

  it("keeps backslashes and line breaks in the title inside the summary", () => {
    const title = "Kino\\sala\nDTSTART:20000101T000000Z";
    const lines = linesOf(calendarFile({ ...poll, title, final: { date: "2026-10-24", firstHour: 19, lastHour: 22 } }, now));

    expect(lines).toContain("SUMMARY:Kino\\\\sala\\nDTSTART:20000101T000000Z");
    expect(lines.filter((line) => line.startsWith("DTSTART"))).toHaveLength(1);
  });
});
