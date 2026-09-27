import { Button } from "@/shared/ui/button/button";
import { Card } from "@/shared/ui/card/card";
import { Text } from "@/shared/ui/text/text";
import type { Run } from "../domain/best-time";
import "./best-time-card.css";
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
    <div className="grid gap-4">
      <section aria-label="Najlepiej">
        <Card tone="ink" label="Najlepiej">
          <div key={label} className="data-changed:animate-[best-time-card-cross-fade_var(--duration-sheet)_var(--ease-out)] [&>p:first-child]:mt-1.5 [&>p:first-child]:mb-3" data-changed={(previousBest && longRunLabel(previousBest) !== label) || undefined}>
            <Text as="p" variant="best-time">
              {label}
            </Text>
            <p className="m-0 flex flex-wrap justify-between gap-x-4 gap-y-1 text-sm">
              <span className="font-semibold text-heat-3">{share(best)} może</span>
              {cannot.length > 0 && <span>Nie może: {cannot.join(", ")}</span>}
            </p>
          </div>
          {onSet && (
            <div className="mt-4">
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
          <ul className="m-0 mt-2 flex list-none gap-2 p-0 lg:flex-col lg:[&>li>*]:flex lg:[&>li>*]:items-baseline lg:[&>li>*]:justify-between" aria-label="Też dobre">
            {others.map((run) => (
              <li key={shortRunLabel(run)} className="flex-1">
                <Card size="compact">
                  <span className="block text-sm font-semibold">{shortRunLabel(run)}</span>
                  <span className="block text-sm text-muted">{share(run)}</span>
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
