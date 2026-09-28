import { hashToken, organiserCookie } from "@/shared/token-cookie";
import { cookies } from "next/headers";
import { pollIdSchema } from "./answer-schema";
import { participantByToken, slotsOf } from "./answer-store";

export async function isOrganiserDevice(poll: { id: string; organiserTokenHash: string }) {
  const token = (await cookies()).get(organiserCookie(poll.id))?.value;

  return token !== undefined && hashToken(token) === poll.organiserTokenHash;
}

export async function findMyAnswer(pollId: string) {
  const token = (await cookies()).get(pollId)?.value;

  if (token === undefined || !pollIdSchema.safeParse(pollId).success) return undefined;

  const participant = participantByToken(pollId, token);

  if (!participant) return undefined;

  return { name: participant.name, slots: slotsOf(participant.id) };
}
