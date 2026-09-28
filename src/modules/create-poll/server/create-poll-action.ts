"use server";

import { todayIn } from "@/shared/dates/iso-date";
import { getDb } from "@/shared/db/client";
import { participants, polls } from "@/shared/db/schema";
import { hashToken, newToken, tokenCookieOptions } from "@/shared/token-cookie";
import { inArray, lt, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { organiserCookie } from "./organiser-access";
import { createPollSchema, type CreatePollInput } from "./poll-schema";
import { cleanupCutoff, hasPastDate } from "../domain/poll-rules";

type CreatePollResult = { ok: true; id: string } | { ok: false; reason: "invalid" };

export async function createPoll(input: CreatePollInput): Promise<CreatePollResult> {
  const parsed = createPollSchema.safeParse(input);
  const now = new Date();
  if (!parsed.success || hasPastDate(parsed.data.dates, todayIn(parsed.data.timeZone, now))) {
    return { ok: false, reason: "invalid" };
  }

  const cookieStore = await cookies();
  const db = getDb();
  const heldTokenHashes = cookieStore.getAll().map((cookie) => hashToken(cookie.value));
  const id = randomBytes(8).toString("base64url").slice(0, 10);
  const organiserToken = newToken();
  const cookieOptions = tokenCookieOptions();

  db.transaction((tx) => {
    const createdByParticipant =
      heldTokenHashes.length > 0 &&
      tx.select({ id: participants.id }).from(participants).where(inArray(participants.tokenHash, heldTokenHashes)).get() !==
        undefined;
    tx.delete(polls)
      .where(lt(sql`(select max(value) from json_each(${polls.dates}))`, cleanupCutoff(now)))
      .run();
    tx.insert(polls)
      .values({
        id,
        ...parsed.data,
        organiserTokenHash: hashToken(organiserToken),
        createdByParticipant,
        createdAt: now,
      })
      .run();
  });

  cookieStore.set(organiserCookie(id), organiserToken, cookieOptions);
  return { ok: true, id };
}
