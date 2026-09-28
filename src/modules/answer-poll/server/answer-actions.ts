"use server";

import { writeLogLine } from "@/shared/log-line";
import { fail, ok, parse, type Failure, type Result } from "@/shared/result";
import { newToken, tokenCookieOptions } from "@/shared/token-cookie";
import { cookies } from "next/headers";
import { fitsPoll, refusalOf, takesOrganiserName } from "../domain/answer-rules";
import { answerSchema, type AnswerInput, type Slot } from "./answer-schema";
import { isOrganiserDevice } from "./answer-queries";
import { claimParticipant, livePoll, participantByToken, participantCount, participantNamed, saveAnswerOf, slotsOf } from "./answer-store";
import { nameKey } from "../domain/name-rules";

type NameTaken = { name: string; hours: number; yours?: { name: string; hours: number } };
type SaveResult =
  Result<object, "invalid" | "organiser-name" | "not-yours" | "closed" | "full" | "gone"> | Failure<"name-taken", NameTaken>;
type ClaimResult = Result<{ name: string; slots: Slot[] }, "invalid" | "organiser-name" | "closed" | "gone">;

export type ClaimRefusal = Extract<ClaimResult, { ok: false }>["reason"];

function openPoll(pollId: string, answer: AnswerInput) {
  const found = livePoll(pollId);
  const parsed = parse(answerSchema, answer);

  if (!found.ok) return found;
  if (!parsed.ok || !fitsPoll(found.poll, parsed.data.slots)) return fail("invalid");
  if (found.poll.finalDate !== null) return fail("closed");

  return ok({ poll: found.poll, data: parsed.data });
}

export async function saveAnswer(pollId: string, answer: AnswerInput): Promise<SaveResult> {
  const opened = openPoll(pollId, answer);

  if (!opened.ok) return opened;

  const { poll, data } = opened;
  const cookieStore = await cookies();
  const token = cookieStore.get(pollId)?.value;
  const participant = token === undefined ? undefined : participantByToken(pollId, token);

  if (token !== undefined && !participant) {
    cookieStore.delete(pollId);

    return fail("not-yours");
  }

  const { name, slots: mySlots } = data;
  const normalisedName = nameKey(name);
  const holder = participantNamed(pollId, normalisedName);
  const ownsName = holder !== undefined && holder.id === participant?.id;
  const yours = participant && { yours: { name: participant.name, hours: slotsOf(participant.id).length } };
  const nameHeldByOther = holder && !ownsName ? { name: holder.name, hours: slotsOf(holder.id).length, ...yours } : undefined;
  const organiserDevice = await isOrganiserDevice(poll);

  const refusal = refusalOf({
    takesOrganiserName: takesOrganiserName({ name, organiserName: poll.organiserName, organiserDevice, ownsName }),
    nameHeldByOther,
    newcomer: !participant,
    participantCount: participantCount(pollId),
  });

  if (refusal) return { ok: false, ...refusal };

  const newcomerToken = newToken();

  saveAnswerOf(pollId, participant, { name, normalisedName, slots: mySlots }, newcomerToken, new Date());
  writeLogLine({ level: "info", message: "answer_saved", pollId });
  if (!participant) cookieStore.set(pollId, newcomerToken, await tokenCookieOptions());

  return ok();
}

export async function claimName(pollId: string, answer: AnswerInput): Promise<ClaimResult> {
  const opened = openPoll(pollId, answer);

  if (!opened.ok) return opened;

  const {
    poll,
    data: { name: claimedName, slots: gridSlots },
  } = opened;

  if (takesOrganiserName({ name: claimedName, organiserName: poll.organiserName, organiserDevice: await isOrganiserDevice(poll) }))
    return fail("organiser-name");

  const cookieStore = await cookies();
  const token = newToken();
  const claimed = claimParticipant(pollId, nameKey(claimedName), gridSlots, cookieStore.get(pollId)?.value, token);

  if (!claimed) return fail("invalid");

  cookieStore.set(pollId, token, await tokenCookieOptions());

  return ok({ name: claimed.name, slots: slotsOf(claimed.id) });
}
