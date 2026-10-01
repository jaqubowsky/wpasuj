import { useDeviceToday } from "@/shared/dates/use-device-today";
import { forgetPolls, useDevicePolls, type DevicePoll } from "@/shared/device-polls";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { answersLine, livePolls, roleLine, settledLine, type FinalTime } from "../../domain/my-polls";

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

export function usePollRows(findPolls: FindPolls, listed: DevicePoll[]) {
  const ids = listed.map(({ id }) => id);

  return useQuery({
    queryKey: ["my-polls", ids],
    queryFn: async () => {
      const found = await findPolls(ids);

      if (!found.ok) throw new Error(found.reason);

      const byId = new Map(found.polls.map((poll) => [poll.id, poll]));

      forgetPolls(ids.filter((id) => !byId.has(id)));

      return listed.flatMap(({ id, role }) => {
        const poll = byId.get(id);

        if (!poll) return [];

        return [
          {
            id,
            title: poll.title,
            roleLine: roleLine(role, poll.dates),
            status: poll.final
              ? { settled: true, line: settledLine(poll.final) }
              : { settled: false, line: answersLine(poll.respondentCount) },
          },
        ];
      });
    },
  });
}
