import { Button } from "@/shared/ui/button/button";
import { Card } from "@/shared/ui/card/card";
import { Text } from "@/shared/ui/text/text";
import type { Run } from "../domain/best-time";
import styles from "./best-time-card.module.css";
import { longRunLabel, shortRunLabel } from "../domain/time-label";

type BestTimeCardProps = {
  best?: Run;
  previousBest?: Run;
  others: Run[];
  respondentCount: number;
  cannot: string[];
  onSet?: (run: Run) => void;
};

export function BestTimeCard({ best, previousBest, others, respondentCount, cannot, onSet }: BestTimeCardProps) {
  const share = (run: Run) => `${run.free.length} z ${respondentCount}`;

  if (!best) {
    return (
      <section aria-label="Najlepiej">
        <Card tone="ink" label="Najlepiej">
          <Text variant="body">Na razie nikt nie może w żadnym terminie.</Text>
        </Card>
      </section>
    );
  }

  const label = longRunLabel(best);

  return (
    <div className={styles.times}>
      <section aria-label="Najlepiej">
        <Card tone="ink" label="Najlepiej">
          <div key={label} className={styles.best} data-changed={(previousBest && longRunLabel(previousBest) !== label) || undefined}>
            <Text as="p" variant="best-time">
              {label}
            </Text>
            <p className={styles.who}>
              <span className={styles.can}>{share(best)} może</span>
              {cannot.length > 0 && <span>Nie może: {cannot.join(", ")}</span>}
            </p>
          </div>
          {onSet && (
            <div className={styles.set}>
              <Button variant="on-dark" block onClick={() => onSet(best)}>
                Ustal ten termin
              </Button>
            </div>
          )}
        </Card>
      </section>
      {others.length > 0 && (
        <div>
          <Text as="h2" variant="meta">
            Też dobre
          </Text>
          <ul className={styles.others} aria-label="Też dobre">
            {others.map((run) => (
              <li key={shortRunLabel(run)}>
                <Card size="compact">
                  <span className={styles.otherTime}>{shortRunLabel(run)}</span>
                  <span className={styles.otherShare}>{share(run)}</span>
                  {onSet && (
                    <Button variant="text" aria-label={`Ustal ten termin: ${shortRunLabel(run)}`} onClick={() => onSet(run)}>
                      Ustal ten termin
                    </Button>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
