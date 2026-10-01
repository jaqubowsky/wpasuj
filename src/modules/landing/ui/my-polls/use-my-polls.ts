import { useDeviceToday } from "@/shared/dates/use-device-today";
import { useDevicePolls, type DevicePoll } from "@/shared/device-polls";
import { useState } from "react";
import { livePolls, type FinalTime } from "../../domain/my-polls";

type FoundPoll = { id: string; title: string; dates: string[]; respondentCount: number; final: FinalTime | null };

export type FindPolls = (ids: string[]) => Promise<{ ok: true; polls: FoundPoll[] } | { ok: false; reason: "invalid" }>;

export function useMyPolls() {
  const devicePolls = useDevicePolls();
  const today = useDeviceToday();
  const live = today === undefined ? [] : livePolls(devicePolls, today);
  const [listed, setListed] = useState<DevicePoll[]>();

  return {
    count: live.length,
    listed,
    open: () => setListed(live),
    close: () => setListed(undefined),
  };
}
