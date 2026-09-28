import { z } from "zod";

const lastSlotHour = 46;

const finalTimeSchema = z.object({ date: z.iso.date(), firstHour: z.int().min(0).max(lastSlotHour), lastHour: z.int().min(1).max(lastSlotHour + 1) });

export const resultsSchema = z.object({
  dates: z.array(z.iso.date()),
  hours: z.array(z.int().min(0).max(lastSlotHour)),
  readAt: z.number(),
  respondents: z.array(
    z.object({
      name: z.string(),
      normalisedName: z.string(),
      savedAt: z.number(),
      slots: z.array(z.object({ date: z.iso.date(), hour: z.int().min(0).max(lastSlotHour) })),
    }),
  ),
  final: finalTimeSchema.nullable(),
  you: z.string().optional(),
});

export type FinalTime = z.infer<typeof finalTimeSchema>;

export type Results = z.infer<typeof resultsSchema>;
