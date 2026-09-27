"use client";

import { Text } from "@/shared/ui/text/text";
import { BestTimeCard } from "./best-time-card";
import { bestTimes, cannotMake } from "../domain/best-time";
import { OrganiserBar } from "./organiser-bar";
import { OrganiserProblem } from "./organiser-problem";
import { PollGone } from "./poll-gone";
import { useResultsContext } from "./results-provider";
import styles from "./results.module.css";

function ResultsHeadline() {
  const { results, previous, organiser } = useResultsContext();
  const { dates, hours, respondents, final } = results;

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
      cannot={best ? cannotMake(respondents, best.free).map((respondent) => respondent.name) : []}
      onSet={organiser && !final ? ({ date, firstHour, lastHour }) => organiser.setFinal({ date, firstHour, lastHour }) : undefined}
    />
  );
}

export function ResultsLead() {
  const { gone, refreshFailed, organiser, organiserProblem, pollId, results } = useResultsContext();

  if (gone) return <PollGone />;

  return (
    <>
      {organiser && (
        <OrganiserBar
          pollId={pollId}
          title={organiser.title}
          token={organiser.token}
          respondentNames={results.respondents.map((respondent) => respondent.name)}
          onDelete={organiser.deletePoll}
        />
      )}
      <div className={styles.lead} data-results-lead>
        {organiserProblem && !results.final && <OrganiserProblem problem={organiserProblem} />}
        <ResultsHeadline />
        {refreshFailed && (
          <Text as="p" variant="meta">
            Nie udało się odświeżyć. Spróbujemy za chwilę.
          </Text>
        )}
      </div>
    </>
  );
}
