"use client";

import { Card } from "@/shared/ui/card/card";
import { Text } from "@/shared/ui/text/text";
import { bestTimes } from "../domain/best-time";
import { longRunLabel } from "../domain/time-label";
import "./best-now.css";
import { useResultsContext } from "./results-provider";

export function BestNow() {
  const { results, previous } = useResultsContext();

  if (results.respondents.length === 0) return null;

  const [best] = bestTimes(results.dates, results.hours, results.respondents);
  const [previousBest] = previous ? bestTimes(previous.dates, previous.hours, previous.respondents) : [];
  const label = best && longRunLabel(best);

  return (
    <section aria-label="Najlepiej teraz">
      <Card tone="ink" label="Najlepiej teraz">
        {label ? (
          <p key={label} className="m-0 mt-1 data-changed:animate-[best-now-cross-fade_var(--duration-sheet)_var(--ease-out)]" data-changed={(previousBest && longRunLabel(previousBest) !== label) || undefined}>
            <Text variant="best-time">{label}</Text>
          </p>
        ) : (
          <p className="m-0 mt-1">
            <Text variant="body">Na razie nikt nie może w żadnym terminie.</Text>
          </p>
        )}
      </Card>
    </section>
  );
}
