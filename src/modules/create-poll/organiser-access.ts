import { getDb } from "@/shared/db/client";
import { polls } from "@/shared/db/schema";
import { hashToken, tokenCookieOptions } from "@/shared/token-cookie";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { pollIdSchema } from "./poll-schema";

export const organiserCookie = (id: string) => `${id}-org`;

function isOrganiserToken(id: string, token: string) {
  if (!pollIdSchema.safeParse(id).success) return false;
  const poll = getDb().select({ organiserTokenHash: polls.organiserTokenHash }).from(polls).where(eq(polls.id, id)).get();
  return poll?.organiserTokenHash === hashToken(token);
}

export async function organiserToken(id: string) {
  const token = (await cookies()).get(organiserCookie(id))?.value;
  return token !== undefined && isOrganiserToken(id, token) ? token : undefined;
}

export async function grantOrganiser(id: string, token: string) {
  if (isOrganiserToken(id, token)) (await cookies()).set(organiserCookie(id), token, tokenCookieOptions);
}
