"use client";

import { Text } from "@/shared/ui/text/text";
import { BestTimeCard } from "./best-time-card";
import { bestTimes, cannotMake } from "./best-time";
import { PollGone } from "./poll-gone";
import { useResultsContext } from "./results-provider";
import styles from "./results.module.css";

function ResultsHeadline() {
  const { results, previous } = useResultsContext();
  const { dates, hours, respondents } = results;

  if (respondents.length === 0) {
    return (
      <div className={styles.empty}>
        <Text variant="body">Nikt jeszcze nie odpowiedział. Wyślij link na grupę.</Text>
      </div>
    );
  }

  const [best, ...others] = bestTimes(dates, hours, respondents);
  const [previousBest] = previous ? bestTimes(previous.dates, previous.hours, previous.respondents) : [];

  return (
    <BestTimeCard
      best={best}
      previousBest={previousBest}
      others={others}
      respondentCount={respondents.length}
      cannot={best ? cannotMake(respondents, best.free) : []}
    />
  );
}

export function ResultsLead() {
  const { gone, refreshFailed } = useResultsContext();

  if (gone) return <PollGone />;

  return (
    <div className={styles.lead}>
      <ResultsHeadline />
      {refreshFailed && (
        <Text as="p" variant="meta">
          Nie udało się odświeżyć. Spróbujemy za chwilę.
        </Text>
      )}
    </div>
  );
}
