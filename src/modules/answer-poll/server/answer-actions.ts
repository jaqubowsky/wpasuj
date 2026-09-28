"use server";

import { getDb } from "@/shared/db/client";
import { participants, slots } from "@/shared/db/schema";
import { hashToken, newToken, tokenCookieOptions } from "@/shared/token-cookie";
import { and, count, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { fitsPoll, refusalOf, takesOrganiserName } from "../domain/answer-rules";
import { answerSchema, nameSchema, type AnswerInput, type Slot } from "./answer-schema";
import { findLivePoll, isOrganiserDevice, participantByToken, slotsOf } from "./answer-queries";
import { nameKey } from "../domain/name-rules";

type SaveResult =
  | { ok: true }
  | { ok: false; reason: "name-taken"; name: string; hours: number; yours?: { name: string; hours: number } }
  | { ok: false; reason: "invalid" | "organiser-name" | "not-yours" | "closed" | "full" | "gone" };
type ClaimResult = { ok: true; name: string; slots: Slot[] } | { ok: false; reason: "invalid" | "organiser-name" | "closed" | "gone" };

export type ClaimRefusal = Extract<ClaimResult, { ok: false }>["reason"];

function participantNamed(pollId: string, normalisedName: string) {
  return getDb()
    .select({ id: participants.id, name: participants.name })
    .from(participants)
    .where(and(eq(participants.pollId, pollId), eq(participants.normalisedName, normalisedName)))
    .get();
}

export async function saveAnswer(pollId: string, answer: AnswerInput): Promise<SaveResult> {
  const poll = findLivePoll(pollId);

  if (!poll) return { ok: false, reason: "gone" };

  const parsed = answerSchema.safeParse(answer);

  if (!parsed.success || !fitsPoll(poll, parsed.data.slots)) return { ok: false, reason: "invalid" };
  if (poll.finalDate !== null) return { ok: false, reason: "closed" };

  const cookieStore = await cookies();
  const token = cookieStore.get(pollId)?.value;
  const participant = token === undefined ? undefined : participantByToken(pollId, token);

  if (token !== undefined && !participant) {
    cookieStore.delete(pollId);

    return { ok: false, reason: "not-yours" };
  }

  const db = getDb();
  const { name, slots: mySlots } = parsed.data;
  const normalisedName = nameKey(name);
  const holder = participantNamed(pollId, normalisedName);
  const [{ participantCount }] = db.select({ participantCount: count() }).from(participants).where(eq(participants.pollId, pollId)).all();
  const ownsName = holder !== undefined && holder.id === participant?.id;
  const yours = participant && { yours: { name: participant.name, hours: slotsOf(participant.id).length } };
  const nameHeldByOther = holder && !ownsName ? { name: holder.name, hours: slotsOf(holder.id).length, ...yours } : undefined;
  const organiserDevice = await isOrganiserDevice(poll);

  const refusal = refusalOf({
    takesOrganiserName: takesOrganiserName({ name, organiserName: poll.organiserName, organiserDevice, ownsName }),
    nameHeldByOther,
    newcomer: !participant,
    participantCount,
  });

  if (refusal) return { ok: false, ...refusal };

  const now = new Date();
  const newcomerToken = newToken();

  db.transaction((tx) => {
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

  if (!participant) cookieStore.set(pollId, newcomerToken, await tokenCookieOptions());

  return { ok: true };
}

export async function claimName(pollId: string, name: string): Promise<ClaimResult> {
  const poll = findLivePoll(pollId);

  if (!poll) return { ok: false, reason: "gone" };

  const parsed = nameSchema.safeParse(name);

  if (!parsed.success) return { ok: false, reason: "invalid" };
  if (poll.finalDate !== null) return { ok: false, reason: "closed" };
  if (takesOrganiserName({ name: parsed.data, organiserName: poll.organiserName, organiserDevice: await isOrganiserDevice(poll) }))
    return { ok: false, reason: "organiser-name" };

  const cookieStore = await cookies();
  const heldToken = cookieStore.get(pollId)?.value;
  const token = newToken();

  const claimed = getDb().transaction((tx) => {
    const row = participantNamed(pollId, nameKey(parsed.data));

    if (!row) return undefined;

    const held = heldToken === undefined ? undefined : participantByToken(pollId, heldToken);

    if (held && held.id !== row.id) {
      const heldSlots = slotsOf(held.id);

      if (heldSlots.length > 0)
        tx.insert(slots)
          .values(heldSlots.map((slot) => ({ participantId: row.id, ...slot })))
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

  if (!claimed) return { ok: false, reason: "invalid" };

  cookieStore.set(pollId, token, await tokenCookieOptions());

  return { ok: true, name: claimed.name, slots: slotsOf(claimed.id) };
}
