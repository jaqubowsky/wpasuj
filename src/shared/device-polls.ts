import { useSyncExternalStore } from "react";
import * as z from "zod/mini";

const storageKey = "device-polls";

const devicePollsSchema = z.array(
  z.object({
    id: z.string(),
    role: z.enum(["organiser", "participant"]),
    lastDate: z.iso.date(),
  }),
);

export type DevicePoll = z.infer<typeof devicePollsSchema>[number];

const noPolls: DevicePoll[] = [];
const listeners = new Set<() => void>();
let read: { raw: string | null; polls: DevicePoll[] } = { raw: null, polls: noPolls };

function parsed(raw: string | null) {
  try {
    return devicePollsSchema.parse(JSON.parse(raw ?? "[]"));
  } catch {
    return noPolls;
  }
}

function readPolls() {
  const raw = localStorage.getItem(storageKey);

  if (raw !== read.raw) read = { raw, polls: parsed(raw) };

  return read.polls;
}

function writePolls(polls: DevicePoll[]) {
  localStorage.setItem(storageKey, JSON.stringify(polls));
  listeners.forEach((listener) => listener());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);

  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useDevicePolls() {
  return useSyncExternalStore(subscribe, readPolls, () => noPolls);
}

export function rememberPoll(poll: DevicePoll) {
  const polls = readPolls();

  if (!polls.some(({ id }) => id === poll.id)) writePolls([poll, ...polls]);
}

export function forgetPolls(ids: string[]) {
  writePolls(readPolls().filter(({ id }) => !ids.includes(id)));
}
