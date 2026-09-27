import { todayIn } from "@/shared/dates/iso-date";
import { getDb } from "@/shared/db/client";
import { participants, polls } from "@/shared/db/schema";
import { count, eq } from "drizzle-orm";
import { isExpired } from "./poll-rules";
import { pollIdSchema } from "./poll-schema";

export function findPoll(id: string, now: Date) {
  if (!pollIdSchema.safeParse(id).success) return undefined;
  const poll = getDb()
    .select({
      title: polls.title,
      organiserName: polls.organiserName,
      dates: polls.dates,
      firstHour: polls.firstHour,
      lastHour: polls.lastHour,
      timeZone: polls.timeZone,
      respondentCount: count(participants.id),
    })
    .from(polls)
    .leftJoin(participants, eq(participants.pollId, polls.id))
    .where(eq(polls.id, id))
    .groupBy(polls.id)
    .get();
  if (!poll || isExpired(poll.dates, todayIn(poll.timeZone, now))) return undefined;
  return poll;
}
