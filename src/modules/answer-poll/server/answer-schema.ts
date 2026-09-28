import { lastSlotHour } from "@/shared/poll-hours";
import { z } from "zod";
import { maxNameLength, normaliseName } from "../domain/name-rules";

export const pollIdSchema = z.string().regex(/^[A-Za-z0-9_-]{10}$/);

export const nameSchema = z.string().transform(normaliseName).pipe(z.string().min(1).max(maxNameLength));

const slotSchema = z.object({ date: z.iso.date(), hour: z.int().min(0).max(lastSlotHour) });

export const answerSchema = z.object({
  name: nameSchema,
  slots: z.array(slotSchema).refine((slots) => new Set(slots.map(({ date, hour }) => `${date} ${hour}`)).size === slots.length),
});

export type Slot = z.infer<typeof slotSchema>;
export type AnswerInput = z.input<typeof answerSchema>;
