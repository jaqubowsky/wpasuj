"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, use, useState, type ReactNode } from "react";
import type { Results } from "./results-schema";
import { useIsOrganiser, type Organiser } from "./use-is-organiser";
import { usePrevious } from "./use-previous";
import { useResults } from "./use-results";

type ResultsProviderProps = { pollId: string; initial: Results; organiser?: Organiser; children: ReactNode };

type LiveResults = ReturnType<typeof useResults> &
  ReturnType<typeof useIsOrganiser> & { pollId: string; previous?: Results };

const ResultsContext = createContext<LiveResults | null>(null);

function LiveResultsProvider({ pollId, initial, organiser, children }: ResultsProviderProps) {
  const live = useResults(pollId, initial);
  const previous = usePrevious(live.results);
  const organiserControls = useIsOrganiser(organiser, live.refresh);
  return <ResultsContext value={{ ...live, ...organiserControls, pollId, previous }}>{children}</ResultsContext>;
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
  if (!results) throw new Error("ResultsLead, ResultsBody and FinalTime render inside ResultsProvider");
  return results;
}
