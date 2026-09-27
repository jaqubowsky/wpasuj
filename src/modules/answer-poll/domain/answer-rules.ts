import { addDays } from "@/shared/dates/iso-date";
import type { Slot } from "../server/answer-schema";

const maxParticipants = 30;

const daysKeptAfterLastDate = 60;

export function isExpired(dates: string[], today: string) {
  const cutoff = addDays(today, -daysKeptAfterLastDate);
  return dates.every((date) => date < cutoff);
}

export function fitsPoll(poll: { dates: string[]; firstHour: number; lastHour: number }, slots: Slot[]) {
  return slots.every((slot) => poll.dates.includes(slot.date) && slot.hour >= poll.firstHour && slot.hour < poll.lastHour);
}

type Standing = { takesOrganiserName?: boolean; nameHeldByOther?: { name: string; hours: number }; newcomer: boolean; participantCount: number };

export function refusalOf({ takesOrganiserName, nameHeldByOther, newcomer, participantCount }: Standing) {
  if (takesOrganiserName) return { reason: "organiser-name" as const };
  if (nameHeldByOther !== undefined) return { reason: "name-taken" as const, ...nameHeldByOther };
  if (newcomer && participantCount >= maxParticipants) return { reason: "full" as const };
  return undefined;
}
