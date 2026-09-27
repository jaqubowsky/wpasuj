"use client";

import { CellPanel } from "./cell-details";
import { newestFirst } from "../domain/newest-first";
import { PeopleList } from "./people-list";
import { useResultsContext } from "./results-provider";

export function PeoplePanel() {
  const { results, previous, organiserKey, selection } = useResultsContext();

  if (results.respondents.length === 0) return null;

  const seen = previous && new Set(previous.respondents.map((respondent) => respondent.normalisedName));

  return (
    <div className="hidden rounded-card bg-surface px-5 pt-2 pb-3 lg:block">
      {selection.selected ? (
        <CellPanel cell={selection.selected} results={results} organiserKey={organiserKey} onClose={selection.close} />
      ) : (
        <PeopleList groups={[{ label: "Odpowiedzieli", people: newestFirst(results.respondents) }]} you={results.you} organiserKey={organiserKey} arrived={(person) => seen !== undefined && !seen.has(person.normalisedName)} />
      )}
    </div>
  );
}
