"use client";

import type { FinalTime } from "../server/results-schema";
import { whoComes } from "../domain/set-time";
import { PeopleList } from "./people-list";
import { useResultsContext } from "./results-provider";

export function WhoComes({ final }: { final: FinalTime }) {
  const { results, organiserKey } = useResultsContext();

  if (results.respondents.length === 0) return null;

  const { coming, cannot } = whoComes(results.respondents, final);
  const groups = [
    { label: "Będzie", people: coming },
    { label: "Nie może", people: cannot, cannot: true },
  ];

  return (
    <section aria-label="Kto będzie" className="rounded-card bg-surface px-5 pt-2 pb-3">
      <PeopleList groups={groups} you={results.you} organiserKey={organiserKey} />
    </section>
  );
}
