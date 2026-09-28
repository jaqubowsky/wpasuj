import { hashToken, organiserCookie, tokenCookieOptions } from "@/shared/token-cookie";
import { cookies } from "next/headers";
import { organiserTokenHashOf } from "./poll-store";

function isOrganiserToken(id: string, token: string) {
  return organiserTokenHashOf(id) === hashToken(token);
}

export async function organiserTokenOf(poll: { id: string; organiserTokenHash: string | undefined }) {
  const token = (await cookies()).get(organiserCookie(poll.id))?.value;

  return token !== undefined && poll.organiserTokenHash === hashToken(token) ? token : undefined;
}

export async function organiserToken(id: string) {
  return organiserTokenOf({ id, organiserTokenHash: organiserTokenHashOf(id) });
}

export async function grantOrganiser(id: string, token: string) {
  if (isOrganiserToken(id, token)) (await cookies()).set(organiserCookie(id), token, await tokenCookieOptions());
}
