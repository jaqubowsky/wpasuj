import * as z from "zod/mini";
import { maxDates } from "../domain/date-presets";

function isTimeZone(zone: string) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: zone });

    return true;
  } catch {
    return false;
  }
}

export const pollIdSchema = z.string().check(z.regex(/^[A-Za-z0-9_-]{10}$/));

export const createPollSchema = z.object({
  title: z.string().check(z.trim(), z.minLength(1), z.maxLength(60)),
  dates: z.pipe(
    z.array(z.iso.date()).check(
      z.minLength(1),
      z.maxLength(maxDates),
      z.refine((dates) => new Set(dates).size === dates.length),
    ),
    z.transform((dates: string[]) => dates.toSorted()),
  ),
  firstHour: z.int().check(z.minimum(0), z.maximum(23)),
  hourCount: z.int().check(z.minimum(1), z.maximum(24)),
  timeZone: z.string().check(z.refine(isTimeZone)),
  organiserName: z.pipe(
    z.pipe(
      z.string(),
      z.transform((name: string) => name.normalize("NFC").trim().replace(/\s+/g, " ")),
    ),
    z.string().check(z.minLength(1), z.maxLength(30)),
  ),
});

export type CreatePollInput = z.input<typeof createPollSchema>;
