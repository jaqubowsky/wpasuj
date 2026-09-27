import { Card } from "@/shared/ui/card/card";
import { Text } from "@/shared/ui/text/text";
import type { Run } from "./best-time";
import styles from "./best-time-card.module.css";
import { longRunLabel, shortRunLabel } from "./time-label";

type BestTimeCardProps = {
  best?: Run;
  previousBest?: Run;
  others: Run[];
  respondents: string[];
};

function share(run: Run, respondents: string[]) {
  return `${run.free.length} z ${respondents.length}`;
}

export function BestTimeCard({ best, previousBest, others, respondents }: BestTimeCardProps) {
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
  const cannot = respondents.filter((name) => !best.free.includes(name));

  return (
    <div className={styles.times}>
      <section aria-label="Najlepiej">
        <Card tone="ink" label="Najlepiej">
          <div key={label} className={styles.best} data-changed={(previousBest && longRunLabel(previousBest) !== label) || undefined}>
            <Text as="p" variant="best-time">
              {label}
            </Text>
            <p className={styles.who}>
              <span className={styles.can}>{share(best, respondents)} może</span>
              {cannot.length > 0 && <span>Nie może: {cannot.join(", ")}</span>}
            </p>
          </div>
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
                  <span className={styles.otherShare}>{share(run, respondents)}</span>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
