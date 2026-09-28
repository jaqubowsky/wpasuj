"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, use, useState, type ReactNode } from "react";
import type { Results } from "../server/results-schema";
import { useIsOrganiser, type Organiser } from "./use-is-organiser";
import { usePrevious } from "./use-previous";
import { useResults } from "./use-results";
import { useSelectedCell } from "./use-selected-cell";

type ResultsProviderProps = { pollId: string; initial: Results; organiser?: Organiser; organiserKey: string; children: ReactNode };

type LiveResults = ReturnType<typeof useResults> &
  ReturnType<typeof useIsOrganiser> & {
    pollId: string;
    organiserKey: string;
    previous?: Results;
    selection: ReturnType<typeof useSelectedCell>;
  };

const ResultsContext = createContext<LiveResults | null>(null);

function LiveResultsProvider({ pollId, initial, organiser, organiserKey, children }: ResultsProviderProps) {
  const live = useResults(pollId, initial);
  const previous = usePrevious(live.results);
  const organiserControls = useIsOrganiser(organiser, live.refresh);
  const selection = useSelectedCell();

  return <ResultsContext value={{ ...live, ...organiserControls, pollId, organiserKey, previous, selection }}>{children}</ResultsContext>;
}

export function ResultsProvider(props: ResultsProviderProps) {
  const [client] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={client}>
      <LiveResultsProvider {...props} />
    </QueryClientProvider>
  );
}

export function useForgetTappedHour() {
  return useResultsContext().selection.close;
}

export function useRefreshResults() {
  return useResultsContext().refresh;
}

export function useResultsContext() {
  const results = use(ResultsContext);

  if (!results) throw new Error("The poll's results parts render inside ResultsProvider");

  return results;
}
