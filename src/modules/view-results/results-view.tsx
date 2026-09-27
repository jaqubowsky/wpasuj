import { Text } from "@/shared/ui/text/text";
import { BestTimeCard } from "./best-time-card";
import { bestTimes } from "./best-time";
import { Heatmap } from "./heatmap";
import { RespondentList } from "./respondent-list";
import type { Results } from "./results-schema";
import styles from "./results-view.module.css";
import { usePrevious } from "./use-previous";

export function ResultsView({ results }: { results: Results }) {
  const previous = usePrevious(results);
  const { dates, hours, respondents } = results;

  if (respondents.length === 0) {
    return (
      <div className={styles.results}>
        <div className={styles.empty}>
          <Text variant="body">Nikt jeszcze nie odpowiedział. Wyślij link na grupę.</Text>
        </div>
      </div>
    );
  }

  const [best, ...others] = bestTimes(dates, hours, respondents);
  const [previousBest] = previous ? bestTimes(previous.dates, previous.hours, previous.respondents) : [];

  return (
    <div className={styles.results}>
      <BestTimeCard best={best} previousBest={previousBest} others={others} respondents={respondents.map((respondent) => respondent.name)} />
      <Heatmap results={results} previous={previous} best={best} />
      <RespondentList results={results} previous={previous} />
    </div>
  );
}
