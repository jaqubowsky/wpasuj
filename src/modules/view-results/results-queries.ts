import { getDb } from "@/shared/db/client";
import { participants, slots } from "@/shared/db/schema";
import { asc, eq } from "drizzle-orm";
import type { Results } from "./results-schema";

export type FindPollGrid = (id: string) => { dates: string[]; firstHour: number; lastHour: number } | undefined;

export function readResults(id: string, findPoll: FindPollGrid, now: Date): Results | undefined {
  const poll = findPoll(id);
  if (!poll) return undefined;
  const db = getDb();
  const respondents = db
    .select({ id: participants.id, name: participants.name, savedAt: participants.updatedAt })
    .from(participants)
    .where(eq(participants.pollId, id))
    .orderBy(asc(participants.id))
    .all();
  const freeSlots = db
    .select({ participantId: slots.participantId, date: slots.date, hour: slots.hour })
    .from(slots)
    .innerJoin(participants, eq(slots.participantId, participants.id))
    .where(eq(participants.pollId, id))
    .orderBy(asc(slots.date), asc(slots.hour))
    .all();

  return {
    dates: poll.dates,
    hours: Array.from({ length: poll.lastHour - poll.firstHour }, (_, index) => poll.firstHour + index),
    readAt: now.getTime(),
    respondents: respondents.map((respondent) => ({
      name: respondent.name,
      savedAt: respondent.savedAt.getTime(),
      slots: freeSlots.filter((slot) => slot.participantId === respondent.id).map(({ date, hour }) => ({ date, hour })),
    })),
  };
}
