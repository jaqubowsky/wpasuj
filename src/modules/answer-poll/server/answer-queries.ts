import { todayIn } from "@/shared/dates/iso-date";
import { getDb } from "@/shared/db/client";
import { participants, polls, slots } from "@/shared/db/schema";
import { hashToken } from "@/shared/token-cookie";
import { and, asc, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { isExpired } from "../domain/answer-rules";
import { pollIdSchema } from "./answer-schema";

export function findLivePoll(pollId: string) {
  if (!pollIdSchema.safeParse(pollId).success) return undefined;

  const poll = getDb().select().from(polls).where(eq(polls.id, pollId)).get();

  if (!poll || isExpired(poll.dates, todayIn(poll.timeZone, new Date()))) return undefined;

  return poll;
}

export async function isOrganiserDevice(poll: { id: string; organiserTokenHash: string }) {
  const token = (await cookies()).get(`${poll.id}-org`)?.value;

  return token !== undefined && hashToken(token) === poll.organiserTokenHash;
}

export function participantByToken(pollId: string, token: string) {
  return getDb()
    .select()
    .from(participants)
    .where(and(eq(participants.pollId, pollId), eq(participants.tokenHash, hashToken(token))))
    .get();
}

export function slotsOf(participantId: number) {
  return getDb()
    .select({ date: slots.date, hour: slots.hour })
    .from(slots)
    .where(eq(slots.participantId, participantId))
    .orderBy(asc(slots.date), asc(slots.hour))
    .all();
}

export async function findMyAnswer(pollId: string) {
  const token = (await cookies()).get(pollId)?.value;

  if (token === undefined || !pollIdSchema.safeParse(pollId).success) return undefined;

  const participant = participantByToken(pollId, token);

  if (!participant) return undefined;

  return { name: participant.name, slots: slotsOf(participant.id) };
}
