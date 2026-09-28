import { todayIn } from "@/shared/dates/iso-date";
import { getDb } from "@/shared/db/client";
import { participants, polls } from "@/shared/db/schema";
import { fail, ok } from "@/shared/result";
import { count, eq, getTableColumns, inArray, lt, sql } from "drizzle-orm";
import { cleanupCutoff, isExpired } from "../domain/poll-rules";
import { isPollId } from "./poll-schema";

type NewPoll = Omit<typeof polls.$inferInsert, "createdByParticipant" | "createdAt">;

export function livePoll(id: string, now: Date) {
  if (!isPollId(id)) return fail("gone");

  const poll = getDb()
    .select({ ...getTableColumns(polls), respondentCount: count(participants.id) })
    .from(polls)
    .leftJoin(participants, eq(participants.pollId, polls.id))
    .where(eq(polls.id, id))
    .groupBy(polls.id)
    .get();

  if (!poll || isExpired(poll.dates, todayIn(poll.timeZone, now))) return fail("gone");

  return ok({ poll });
}

export function organiserTokenHashOf(id: string) {
  if (!isPollId(id)) return undefined;

  return getDb().select({ organiserTokenHash: polls.organiserTokenHash }).from(polls).where(eq(polls.id, id)).get()?.organiserTokenHash;
}

export function insertPoll(poll: NewPoll, heldTokenHashes: string[], now: Date) {
  getDb().transaction((tx) => {
    const createdByParticipant =
      heldTokenHashes.length > 0 &&
      tx.select({ id: participants.id }).from(participants).where(inArray(participants.tokenHash, heldTokenHashes)).get() !== undefined;

    tx.delete(polls)
      .where(lt(sql`(select max(value) from json_each(${polls.dates}))`, cleanupCutoff(now)))
      .run();

    tx.insert(polls)
      .values({ ...poll, createdByParticipant, createdAt: now })
      .run();
  });
}

export function saveFinal(id: string, final: { date: string; firstHour: number; lastHour: number } | null) {
  getDb()
    .update(polls)
    .set({ finalDate: final?.date ?? null, finalFirstHour: final?.firstHour ?? null, finalLastHour: final?.lastHour ?? null })
    .where(eq(polls.id, id))
    .run();
}

export function removePoll(id: string) {
  getDb().delete(polls).where(eq(polls.id, id)).run();
}
