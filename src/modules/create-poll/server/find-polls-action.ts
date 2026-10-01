"use server";

import { ok, parse } from "@/shared/result";
import * as z from "zod/mini";
import { findPoll } from "./poll-queries";

const idsSchema = z.array(z.string()).check(z.maxLength(100));

export async function findPolls(ids: string[]) {
  const parsed = parse(idsSchema, ids);

  if (!parsed.ok) return parsed;

  const now = new Date();

  const polls = parsed.data.flatMap((id) => {
    const poll = findPoll(id, now);

    return poll ? [{ id, title: poll.title, dates: poll.dates, respondentCount: poll.respondentCount, final: poll.final }] : [];
  });

  return ok({ polls });
}
