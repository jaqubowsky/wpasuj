import { z } from "zod";
import { maxDates } from "../domain/date-presets";

function isTimeZone(zone: string) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}

export const pollIdSchema = z.string().regex(/^[A-Za-z0-9_-]{10}$/);

export const createPollSchema = z
  .object({
    title: z.string().trim().min(1).max(60),
    dates: z
      .array(z.iso.date())
      .min(1)
      .max(maxDates)
      .refine((dates) => new Set(dates).size === dates.length)
      .transform((dates) => dates.toSorted()),
    firstHour: z.int().min(0).max(23),
    hourCount: z.int().min(1).max(24),
    timeZone: z.string().refine(isTimeZone),
    organiserName: z
      .string()
      .transform((name) => name.normalize("NFC").trim().replace(/\s+/g, " "))
      .pipe(z.string().min(1).max(30)),
  });

export type CreatePollInput = z.input<typeof createPollSchema>;
