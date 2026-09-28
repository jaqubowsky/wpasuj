"use server";

import { todayIn } from "@/shared/dates/iso-date";
import { getDb } from "@/shared/db/client";
import { polls } from "@/shared/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { organiserTokenOf } from "./organiser-access";
import { fitsPoll, isExpired } from "../domain/poll-rules";
import { isPollId } from "./poll-queries";

type OrganiserResult = { ok: true } | { ok: false; reason: "invalid" | "not-organiser" | "gone" };

const finalTimeSchema = z
  .object({ date: z.iso.date(), firstHour: z.int().min(0).max(46), lastHour: z.int().min(1).max(47) })
  .refine((final) => final.lastHour > final.firstHour);

type FinalTime = z.infer<typeof finalTimeSchema>;

async function organisersPoll(id: string) {
  if (!isPollId(id)) return "gone";
  const poll = getDb().select().from(polls).where(eq(polls.id, id)).get();
  if (!poll || isExpired(poll.dates, todayIn(poll.timeZone, new Date()))) return "gone";
  if ((await organiserTokenOf(poll)) === undefined) return "not-organiser";
  return poll;
}

export async function setFinal(id: string, final: FinalTime): Promise<OrganiserResult> {
  const parsed = finalTimeSchema.safeParse(final);
  if (!parsed.success) return { ok: false, reason: "invalid" };
  const poll = await organisersPoll(id);
  if (typeof poll === "string") return { ok: false, reason: poll };
  if (!fitsPoll(poll, parsed.data)) return { ok: false, reason: "invalid" };
  const { date, firstHour, lastHour } = parsed.data;

  getDb()
    .update(polls)
    .set({ finalDate: date, finalFirstHour: firstHour, finalLastHour: lastHour })
    .where(eq(polls.id, id))
    .run();
  return { ok: true };
}

export async function clearFinal(id: string): Promise<OrganiserResult> {
  const poll = await organisersPoll(id);
  if (typeof poll === "string") return { ok: false, reason: poll };

  getDb().update(polls).set({ finalDate: null, finalFirstHour: null, finalLastHour: null }).where(eq(polls.id, id)).run();
  return { ok: true };
}

export async function deletePoll(id: string): Promise<OrganiserResult> {
  const poll = await organisersPoll(id);
  if (typeof poll === "string") return { ok: false, reason: poll };

  getDb().delete(polls).where(eq(polls.id, id)).run();
  return { ok: true };
}
