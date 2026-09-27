"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, use, useState, type ReactNode } from "react";
import type { Results } from "./results-schema";
import { usePrevious } from "./use-previous";
import { useResults } from "./use-results";

type ResultsProviderProps = { pollId: string; initial: Results; children: ReactNode };

type LiveResults = ReturnType<typeof useResults> & { previous?: Results };

const ResultsContext = createContext<LiveResults | null>(null);

function LiveResultsProvider({ pollId, initial, children }: ResultsProviderProps) {
  const live = useResults(pollId, initial);
  const previous = usePrevious(live.results);
  return <ResultsContext value={{ ...live, previous }}>{children}</ResultsContext>;
}

export function ResultsProvider(props: ResultsProviderProps) {
  const [client] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={client}>
      <LiveResultsProvider {...props} />
    </QueryClientProvider>
  );
}

export function useResultsContext() {
  const results = use(ResultsContext);
  if (!results) throw new Error("ResultsLead and ResultsBody render inside ResultsProvider");
  return results;
}
