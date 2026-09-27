"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ResultsView } from "./results-view";
import type { Results } from "./results-schema";
import { useResults } from "./use-results";

type LiveResultsProps = { pollId: string; initial: Results };

function FreshResults({ pollId, initial }: LiveResultsProps) {
  return <ResultsView {...useResults(pollId, initial)} />;
}

export function LiveResults(props: LiveResultsProps) {
  const [client] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={client}>
      <FreshResults {...props} />
    </QueryClientProvider>
  );
}
