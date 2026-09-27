import { focusManager, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { resultsSchema, type Results } from "./results-schema";

const refreshEvery = 8_000;

class PollGone extends Error {}

const isGone = (query: { state: { error: unknown } }) => query.state.error instanceof PollGone;

function refetchOnFocusAndVisibility() {
  focusManager.setEventListener((onFocus) => {
    const listener = () => onFocus();
    window.addEventListener("focus", listener);
    window.addEventListener("visibilitychange", listener);
    return () => {
      window.removeEventListener("focus", listener);
      window.removeEventListener("visibilitychange", listener);
    };
  });
}

export function useResults(pollId: string, initial: Results) {
  useEffect(refetchOnFocusAndVisibility, []);

  const query = useQuery({
    queryKey: ["results", pollId],
    queryFn: async () => {
      const response = await fetch(`/api/polls/${pollId}`, { cache: "no-store" });
      if (response.status === 404) throw new PollGone();
      if (!response.ok) throw new Error(`The results answered ${response.status}`);
      return resultsSchema.parse(await response.json());
    },
    initialData: initial,
    initialDataUpdatedAt: initial.readAt,
    staleTime: refreshEvery,
    retry: false,
    refetchInterval: (query) => !isGone(query) && refreshEvery,
    refetchOnWindowFocus: (query) => !isGone(query) && "always",
  });

  const gone = query.error instanceof PollGone;
  return { results: query.data, gone, refreshFailed: query.isRefetchError && !gone, refresh: query.refetch };
}
