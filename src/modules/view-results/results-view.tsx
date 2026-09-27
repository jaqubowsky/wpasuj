import { Text } from "@/shared/ui/text/text";
import { BestTimeCard } from "./best-time-card";
import { bestTimes, cannotMake, freeAt } from "./best-time";
import { CellDetails } from "./cell-details";
import { Heatmap } from "./heatmap";
import { PollGone } from "./poll-gone";
import { RespondentList } from "./respondent-list";
import type { Results } from "./results-schema";
import styles from "./results-view.module.css";
import { usePrevious } from "./use-previous";
import { useSelectedCell } from "./use-selected-cell";

type ResultsViewProps = { results: Results; gone: boolean; refreshFailed: boolean };

export function ResultsView({ results, gone, refreshFailed }: ResultsViewProps) {
  const previous = usePrevious(results);
  const selection = useSelectedCell();
  const { dates, hours, respondents } = results;

  if (gone) {
    return (
      <div className={styles.lead} data-results-lead>
        <PollGone />
      </div>
    );
  }

  const failed = refreshFailed && (
    <Text as="p" variant="meta">
      Nie udało się odświeżyć. Spróbujemy za chwilę.
    </Text>
  );

  if (respondents.length === 0) {
    return (
      <div className={styles.lead} data-results-lead>
        <div className={styles.empty}>
          <Text variant="body">Nikt jeszcze nie odpowiedział. Wyślij link na grupę.</Text>
        </div>
        {failed}
      </div>
    );
  }

  const [best, ...others] = bestTimes(dates, hours, respondents);
  const [previousBest] = previous ? bestTimes(previous.dates, previous.hours, previous.respondents) : [];
  const selectedFree = selection.selected && freeAt(respondents, selection.selected);

  return (
    <>
      <aside className={styles.side} data-results-side>
        <div className={styles.lead} data-results-lead>
          <BestTimeCard
            best={best}
            previousBest={previousBest}
            others={others}
            respondentCount={respondents.length}
            cannot={best ? cannotMake(respondents, best.free) : []}
          />
          {failed}
        </div>
        {selection.selected && selectedFree && (
          <CellDetails cell={selection.selected} free={selectedFree} cannot={cannotMake(respondents, selectedFree)} onClose={selection.close} />
        )}
        <div className={styles.people}>
          <RespondentList results={results} previous={previous} />
        </div>
      </aside>
      <Heatmap results={results} best={best} isSelected={selection.isSelected} onCellTap={selection.toggle} />
    </>
  );
}
