"use client";

import { Card } from "@/shared/ui/card/card";
import { Text } from "@/shared/ui/text/text";
import { bestTimes } from "../domain/best-time";
import { longRunLabel, runParts } from "../domain/time-label";
import { useResultsContext } from "./results-provider";
import { useBurstOnChange } from "./use-burst-on-change";

function BestTime({ run }: { run: Parameters<typeof runParts>[0] }) {
  const { day, hours } = runParts(run);

  return (
    <p className="m-0">
      <Text variant="best-time">
        {day}, <span className="whitespace-nowrap">{hours}</span>
      </Text>
    </p>
  );
}

export function BestNow() {
  const { results, previous } = useResultsContext();
  const [best] = bestTimes(results.dates, results.hours, results.respondents);
  const [previousBest] = previous ? bestTimes(previous.dates, previous.hours, previous.respondents) : [];
  const bestLabel = best && longRunLabel(best);
  const section = useBurstOnChange<HTMLElement>(bestLabel);

  if (results.respondents.length === 0) return null;

  return (
    <section ref={section} aria-label="Najlepiej teraz">
      <Card key={bestLabel} tone="ink" label="Najlepiej teraz" pulse={!!previousBest && !!best && longRunLabel(previousBest) !== bestLabel}>
        {best ? (
          <div className="mt-1 flex items-end justify-between gap-3">
            <BestTime run={best} />
            <span className="font-display text-lg font-extrabold whitespace-nowrap text-heat-3">
              {best.free.length} z {results.respondents.length}
              <span className="sr-only"> może</span>
            </span>
          </div>
        ) : (
          <p className="m-0 mt-1">
            <Text variant="body">Na razie nikt nie może w żadnym terminie.</Text>
          </p>
        )}
      </Card>
    </section>
  );
}
