"use server";

import { todayIn } from "@/shared/dates/iso-date";
import { writeLogLine } from "@/shared/log-line";
import { fail, ok, parse, type Result } from "@/shared/result";
import { hashToken, newToken, organiserCookie, tokenCookieOptions } from "@/shared/token-cookie";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { createPollSchema, type CreatePollInput } from "./poll-schema";
import { hasPastDate } from "../domain/poll-rules";
import { insertPoll } from "./poll-store";

type CreatePollResult = Result<{ id: string }, "invalid">;

export async function createPoll(input: CreatePollInput): Promise<CreatePollResult> {
  const parsed = parse(createPollSchema, input);
  const now = new Date();

  if (!parsed.ok) return parsed;
  if (hasPastDate(parsed.data.dates, todayIn(parsed.data.timeZone, now))) return fail("invalid");

  const cookieStore = await cookies();
  const heldTokenHashes = cookieStore.getAll().map((cookie) => hashToken(cookie.value));
  const id = randomBytes(8).toString("base64url").slice(0, 10);
  const organiserToken = newToken();

  const createdByParticipant = insertPoll({ id, ...parsed.data, organiserTokenHash: hashToken(organiserToken) }, heldTokenHashes, now);

  writeLogLine({ level: "info", message: "poll_created", pollId: id, createdByParticipant });
  cookieStore.set(organiserCookie(id), organiserToken, await tokenCookieOptions());

  return ok({ id });
}
