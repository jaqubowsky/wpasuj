import { forgetPolls, type DevicePoll } from "@/shared/device-polls";
import { useQuery } from "@tanstack/react-query";
import { answersLine, roleLine, settledLine } from "../../domain/my-polls";
import type { FindPolls } from "./use-my-polls";

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
