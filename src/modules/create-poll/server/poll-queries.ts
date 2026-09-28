import { livePoll } from "./poll-store";

export function findPoll(id: string, now: Date) {
  const found = livePoll(id, now);

  if (!found.ok) return undefined;

  const { title, organiserName, dates, firstHour, hourCount, timeZone, respondentCount, finalDate, finalFirstHour, finalLastHour } =
    found.poll;

  const final =
    finalDate !== null && finalFirstHour !== null && finalLastHour !== null
      ? { date: finalDate, firstHour: finalFirstHour, lastHour: finalLastHour }
      : null;

  return { title, organiserName, dates, firstHour, hourCount, timeZone, respondentCount, final };
}
