import { todayIn } from "@/shared/dates/iso-date";
import { getDb } from "@/shared/db/client";
import { participants, polls, slots } from "@/shared/db/schema";
import { fail, ok } from "@/shared/result";
import { hashToken } from "@/shared/token-cookie";
import { and, asc, count, eq } from "drizzle-orm";
import { isExpired } from "../domain/answer-rules";
import { pollIdSchema, type Slot } from "./answer-schema";

type Answer = { name: string; normalisedName: string; slots: Slot[] };

export function livePoll(pollId: string) {
  if (!pollIdSchema.safeParse(pollId).success) return fail("gone");

  const poll = getDb().select().from(polls).where(eq(polls.id, pollId)).get();

  if (!poll || isExpired(poll.dates, todayIn(poll.timeZone, new Date()))) return fail("gone");

  return ok({ poll });
}

export function participantByToken(pollId: string, token: string) {
  return getDb()
    .select()
    .from(participants)
    .where(and(eq(participants.pollId, pollId), eq(participants.tokenHash, hashToken(token))))
    .get();
}

export function participantNamed(pollId: string, normalisedName: string) {
  return getDb()
    .select({ id: participants.id, name: participants.name })
    .from(participants)
    .where(and(eq(participants.pollId, pollId), eq(participants.normalisedName, normalisedName)))
    .get();
}

export function participantCount(pollId: string) {
  const [{ participantCount }] = getDb()
    .select({ participantCount: count() })
    .from(participants)
    .where(eq(participants.pollId, pollId))
    .all();

  return participantCount;
}

export function slotsOf(participantId: number) {
  return getDb()
    .select({ date: slots.date, hour: slots.hour })
    .from(slots)
    .where(eq(slots.participantId, participantId))
    .orderBy(asc(slots.date), asc(slots.hour))
    .all();
}

export function saveAnswerOf(pollId: string, participant: { id: number } | undefined, answer: Answer, newcomerToken: string, now: Date) {
  const { name, normalisedName, slots: mySlots } = answer;

  getDb().transaction((tx) => {
    const id = participant
      ? tx
          .update(participants)
          .set({ name, normalisedName, updatedAt: now })
          .where(eq(participants.id, participant.id))
          .returning({ id: participants.id })
          .get().id
      : tx
          .insert(participants)
          .values({ pollId, name, normalisedName, tokenHash: hashToken(newcomerToken), createdAt: now, updatedAt: now })
          .returning({ id: participants.id })
          .get().id;

    tx.delete(slots).where(eq(slots.participantId, id)).run();
    if (mySlots.length > 0)
      tx.insert(slots)
        .values(mySlots.map((slot) => ({ participantId: id, ...slot })))
        .run();
  });
}

export function claimParticipant(pollId: string, normalisedName: string, gridSlots: Slot[], heldToken: string | undefined, token: string) {
  return getDb().transaction((tx) => {
    const row = participantNamed(pollId, normalisedName);

    if (!row) return undefined;

    const held = heldToken === undefined ? undefined : participantByToken(pollId, heldToken);

    if (held && held.id !== row.id) {
      if (gridSlots.length > 0)
        tx.insert(slots)
          .values(gridSlots.map((slot) => ({ participantId: row.id, ...slot })))
          .onConflictDoNothing()
          .run();

      tx.delete(participants).where(eq(participants.id, held.id)).run();
    }

    tx.update(participants)
      .set({ tokenHash: hashToken(token) })
      .where(eq(participants.id, row.id))
      .run();

    return row;
  });
}
