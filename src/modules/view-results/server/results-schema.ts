import { lastSlotHour } from "@/shared/poll-hours";
import * as z from "zod/mini";

const finalTimeSchema = z.object({
  date: z.iso.date(),
  firstHour: z.int().check(z.minimum(0), z.maximum(lastSlotHour)),
  lastHour: z.int().check(z.minimum(1), z.maximum(lastSlotHour + 1)),
});

export const resultsSchema = z.object({
  dates: z.array(z.iso.date()),
  hours: z.array(z.int().check(z.minimum(0), z.maximum(lastSlotHour))),
  readAt: z.number(),
  respondents: z.array(
    z.object({
      name: z.string(),
      normalisedName: z.string(),
      savedAt: z.number(),
      slots: z.array(z.object({ date: z.iso.date(), hour: z.int().check(z.minimum(0), z.maximum(lastSlotHour)) })),
    }),
  ),
  final: z.nullable(finalTimeSchema),
  you: z.optional(z.string()),
});

export type FinalTime = z.infer<typeof finalTimeSchema>;

export type Results = z.infer<typeof resultsSchema>;
