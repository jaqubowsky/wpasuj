import { getDb } from "@/shared/db/client";
import { polls } from "@/shared/db/schema";
import { hashToken, tokenCookieOptions } from "@/shared/token-cookie";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { isPollId } from "./poll-queries";

export const organiserCookie = (id: string) => `${id}-org`;

function organiserTokenHash(id: string) {
  if (!isPollId(id)) return undefined;

  return getDb().select({ organiserTokenHash: polls.organiserTokenHash }).from(polls).where(eq(polls.id, id)).get()?.organiserTokenHash;
}

function isOrganiserToken(id: string, token: string) {
  return organiserTokenHash(id) === hashToken(token);
}

export async function organiserTokenOf(poll: { id: string; organiserTokenHash: string | undefined }) {
  const token = (await cookies()).get(organiserCookie(poll.id))?.value;

  return token !== undefined && poll.organiserTokenHash === hashToken(token) ? token : undefined;
}

export async function organiserToken(id: string) {
  return organiserTokenOf({ id, organiserTokenHash: organiserTokenHash(id) });
}

export async function grantOrganiser(id: string, token: string) {
  if (isOrganiserToken(id, token)) (await cookies()).set(organiserCookie(id), token, await tokenCookieOptions());
}
