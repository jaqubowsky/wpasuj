import { z } from "zod";

export const resultsSchema = z.object({
  dates: z.array(z.iso.date()),
  hours: z.array(z.int().min(0).max(23)),
  readAt: z.number(),
  respondents: z.array(
    z.object({
      name: z.string(),
      savedAt: z.number(),
      slots: z.array(z.object({ date: z.iso.date(), hour: z.int().min(0).max(23) })),
    }),
  ),
});

export type Results = z.infer<typeof resultsSchema>;
