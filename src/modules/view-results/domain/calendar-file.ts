import { productName } from "@/shared/brand";

type FinalTime = { date: string; firstHour: number; lastHour: number };

const maxLineOctets = 75;

function offsetAt(instant: number, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).formatToParts(instant);
  const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((each) => each.type === type)?.value);
  const wallClock = Date.UTC(part("year"), part("month") - 1, part("day"), part("hour"), part("minute"), part("second"));
  return wallClock - instant;
}

function instantOf(date: string, hour: number, timeZone: string) {
  const [year, month, day] = date.split("-").map(Number);
  const wallClock = Date.UTC(year, month - 1, day, hour);
  const firstGuess = wallClock - offsetAt(wallClock, timeZone);
  return new Date(wallClock - offsetAt(firstGuess, timeZone));
}

function utcStamp(instant: Date) {
  return instant.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escaped(text: string) {
  return text.replace(/[\\;,]/g, (character) => `\\${character}`).replace(/\r\n|\r|\n/g, "\\n");
}

function folded(line: string) {
  const encoder = new TextEncoder();
  const pieces = [""];
  for (const character of line) {
    const limit = pieces.length === 1 ? maxLineOctets : maxLineOctets - 1;
    if (encoder.encode(pieces.at(-1) + character).length > limit) pieces.push("");
    pieces[pieces.length - 1] += character;
  }
  return pieces.join("\r\n ");
}

export function calendarFile({ id, site, title, timeZone, final }: { id: string; site: string; title: string; timeZone: string; final: FinalTime }, now: Date) {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${productName}//PL`,
    "BEGIN:VEVENT",
    `UID:${id}@${site}`,
    `DTSTAMP:${utcStamp(now)}`,
    `SEQUENCE:${Math.floor(now.getTime() / 60_000)}`,
    `DTSTART:${utcStamp(instantOf(final.date, final.firstHour, timeZone))}`,
    `DTEND:${utcStamp(instantOf(final.date, final.lastHour, timeZone))}`,
    `SUMMARY:${escaped(title)}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ]
    .map(folded)
    .join("\r\n");
}
