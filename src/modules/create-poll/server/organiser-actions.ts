"use server";

import { fail, ok, parse, type Result } from "@/shared/result";
import { z } from "zod";
import { organiserTokenOf } from "./organiser-access";
import { fitsPoll } from "../domain/poll-rules";
import { livePoll, removePoll, saveFinal } from "./poll-store";

type OrganiserResult = Result<object, "invalid" | "not-organiser" | "gone">;

const finalTimeSchema = z
  .object({ date: z.iso.date(), firstHour: z.int().min(0).max(46), lastHour: z.int().min(1).max(47) })
  .refine((final) => final.lastHour > final.firstHour);

type FinalTime = z.infer<typeof finalTimeSchema>;

async function organisersPoll(id: string) {
  const found = livePoll(id, new Date());

  if (!found.ok) return found;
  if ((await organiserTokenOf(found.poll)) === undefined) return fail("not-organiser");

  return found;
}

export async function setFinal(id: string, final: FinalTime): Promise<OrganiserResult> {
  const parsed = parse(finalTimeSchema, final);

  if (!parsed.ok) return parsed;

  const found = await organisersPoll(id);

  if (!found.ok) return found;
  if (!fitsPoll(found.poll, parsed.data)) return fail("invalid");

  saveFinal(id, parsed.data);

  return ok();
}

export async function clearFinal(id: string): Promise<OrganiserResult> {
  const found = await organisersPoll(id);

  if (!found.ok) return found;

  saveFinal(id, null);

  return ok();
}

export async function deletePoll(id: string): Promise<OrganiserResult> {
  const found = await organisersPoll(id);

  if (!found.ok) return found;

  removePoll(id);

  return ok();
}
