"use client";

import { Card } from "@/shared/ui/card/card";
import { Text } from "@/shared/ui/text/text";
import { OrganiserProblem } from "./organiser-problem";
import { useResultsContext } from "./results-provider";
import { hourLabel } from "../domain/time-label";

export function FinalTime() {
  const { results, gone, pollId, organiser, organiserProblem } = useResultsContext();
  const { final } = results;

  if (gone || !final) return null;

  return (
    <section aria-label="Ustalone" className="mt-4 [&_p[role=alert]]:mt-3 [&_p[role=alert]]:text-heat-3">
      <Card tone="ink" label="Ustalone">
        <p className="mx-[0] mt-[6px] mb-4">
          <Text variant="best-time">{hourLabel({ date: final.date, hour: final.firstHour })}</Text>
        </p>
        <div className="flex items-center gap-4">
          <a className="box-border inline-flex h-button items-center rounded-control bg-surface px-5 font-sans text-button font-semibold normal-nums text-ink no-underline transition-transform duration-(--duration-fill) ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface motion-safe:active:scale-97" href={`/e/${pollId}/termin.ics`} download>
            Dodaj do kalendarza
          </a>
          {organiser && (
            <button type="button" className="min-h-target cursor-pointer border-0 bg-transparent px-2 py-[0] font-sans text-button font-medium normal-nums text-on-dark-muted underline underline-offset-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface" onClick={organiser.clearFinal}>
              Zmień
            </button>
          )}
        </div>
        {organiserProblem && <OrganiserProblem problem={organiserProblem} />}
      </Card>
    </section>
  );
}
