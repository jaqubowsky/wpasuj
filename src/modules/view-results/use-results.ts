import { useQuery } from "@tanstack/react-query";
import { resultsSchema, type Results } from "./results-schema";

const refreshEvery = 10_000;

export function useResults(pollId: string, initial: Results) {
  return useQuery({
    queryKey: ["results", pollId],
    queryFn: async () => {
      const response = await fetch(`/api/polls/${pollId}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`The results answered ${response.status}`);
      return resultsSchema.parse(await response.json());
    },
    initialData: initial,
    staleTime: refreshEvery,
    refetchInterval: refreshEvery,
    refetchOnWindowFocus: "always",
  }).data;
}
