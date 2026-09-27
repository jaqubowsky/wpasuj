"use client";

import { Card } from "@/shared/ui/card/card";
import { Text } from "@/shared/ui/text/text";
import styles from "./final-time.module.css";
import { OrganiserProblem } from "./organiser-problem";
import { useResultsContext } from "./results-provider";
import { hourLabel } from "./time-label";

export function FinalTime() {
  const { results, gone, pollId, organiser, organiserProblem } = useResultsContext();
  const { final } = results;

  if (gone || !final) return null;

  return (
    <section aria-label="Ustalone" className={styles.final}>
      <Card tone="ink" label="Ustalone">
        <p className={styles.time}>
          <Text variant="best-time">{hourLabel({ date: final.date, hour: final.firstHour })}</Text>
        </p>
        <div className={styles.actions}>
          <a className={styles.calendar} href={`/e/${pollId}/termin.ics`} download>
            Dodaj do kalendarza
          </a>
          {organiser && (
            <button type="button" className={styles.change} onClick={organiser.clearFinal}>
              Zmień
            </button>
          )}
        </div>
        {organiserProblem && <OrganiserProblem problem={organiserProblem} />}
      </Card>
    </section>
  );
}
