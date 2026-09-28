"use client";

import { Card } from "@/shared/ui/card/card";
import { Text } from "@/shared/ui/text/text";
import { bestTimes } from "../domain/best-time";
import { longRunLabel, runParts } from "../domain/time-label";
import "./best-now.css";
import { useResultsContext } from "./results-provider";

function BestTime({ run, changed }: { run: Parameters<typeof runParts>[0]; changed?: boolean }) {
  const { day, hours } = runParts(run);

  return (
    <p className="m-0 mt-1 data-changed:animate-[best-now-cross-fade_var(--duration-sheet)_var(--ease-out)]" data-changed={changed || undefined}>
      <Text variant="best-time">
        {day}, <span className="whitespace-nowrap">{hours}</span>
      </Text>
    </p>
  );
}

export function BestNow() {
  const { results, previous } = useResultsContext();

  if (results.respondents.length === 0) return null;

  const [best] = bestTimes(results.dates, results.hours, results.respondents);
  const [previousBest] = previous ? bestTimes(previous.dates, previous.hours, previous.respondents) : [];

  return (
    <section aria-label="Najlepiej teraz">
      <Card tone="ink" label="Najlepiej teraz">
        {best ? (
          <BestTime key={longRunLabel(best)} run={best} changed={previousBest && longRunLabel(previousBest) !== longRunLabel(best)} />
        ) : (
          <p className="m-0 mt-1">
            <Text variant="body">Na razie nikt nie może w żadnym terminie.</Text>
          </p>
        )}
      </Card>
    </section>
  );
}
