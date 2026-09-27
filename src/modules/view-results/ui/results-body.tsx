"use client";

import { bestTimes, cannotMake, freeAt } from "../domain/best-time";
import { CellDetails } from "./cell-details";
import { Heatmap } from "./heatmap";
import { RespondentList } from "./respondent-list";
import { useResultsContext } from "./results-provider";
import styles from "./results.module.css";
import { useSelectedCell } from "./use-selected-cell";

export function ResultsBody() {
  const { results, previous, gone } = useResultsContext();
  const selection = useSelectedCell();
  const { dates, hours, respondents } = results;

  if (gone || respondents.length === 0) return null;

  const [best] = bestTimes(dates, hours, respondents);
  const selectedFree = selection.selected && freeAt(respondents, selection.selected);

  return (
    <div className={styles.body} data-results-body>
      <Heatmap results={results} best={best} isSelected={selection.isSelected} onCellTap={selection.toggle} />
      <aside className={styles.side} data-results-side>
        {selection.selected && selectedFree && (
          <CellDetails
            cell={selection.selected}
            free={selectedFree}
            cannot={cannotMake(respondents, selectedFree.map((respondent) => respondent.name))}
            onClose={selection.close}
          />
        )}
        <RespondentList results={results} previous={previous} />
      </aside>
    </div>
  );
}
