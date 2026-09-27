import { DayHourGrid, type GridCell } from "@/shared/day-hour-grid/day-hour-grid";
import { Cell } from "@/shared/ui/cell/cell";
import { Text } from "@/shared/ui/text/text";
import { freeAt, type Run } from "./best-time";
import { CellDetails } from "./cell-details";
import { heatOf } from "./heat";
import styles from "./heatmap.module.css";
import type { Results } from "./results-schema";
import { useSelectedCell } from "./use-selected-cell";

type HeatmapProps = {
  results: Results;
  previous?: Results;
  best?: Run;
};

const ramp = [1, 2, 3, 4, 5];

export function Heatmap({ results, previous, best }: HeatmapProps) {
  const selection = useSelectedCell();
  const respondents = results.respondents.map((respondent) => respondent.name);
  const isBest = ({ date, hour }: GridCell) => best?.date === date && hour >= best.firstHour && hour < best.lastHour;

  return (
    <section>
      <div className={styles.legend}>
        <Text variant="meta">Kliknij godzinę, żeby zobaczyć, kto może</Text>
        <span className={styles.ramp} aria-hidden>
          {ramp.map((heat) => (
            <span key={heat} data-heat={heat} />
          ))}
        </span>
      </div>
      <DayHourGrid
        label="Kto może"
        dates={results.dates}
        hours={results.hours}
        isSelected={selection.isSelected}
        renderCell={({ label, tabIndex, date, hour }) => {
          const count = freeAt(results.respondents, { date, hour }).length;
          const before = previous && freeAt(previous.respondents, { date, hour }).length;
          return (
            <Cell
              heat={heatOf(count, respondents.length)}
              everyone={count === respondents.length}
              best={isBest({ date, hour })}
              bump={before !== undefined && count > before}
              aria-label={`${label}, ${count} z ${respondents.length} może`}
              tabIndex={tabIndex}
            >
              {count > 0 && count}
            </Cell>
          );
        }}
        onCellTap={selection.toggle}
      />
      {selection.selected && (
        <CellDetails
          cell={selection.selected}
          free={freeAt(results.respondents, selection.selected)}
          respondents={respondents}
          onClose={selection.close}
        />
      )}
    </section>
  );
}
