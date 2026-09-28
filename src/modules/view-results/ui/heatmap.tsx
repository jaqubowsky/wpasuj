import { DayHourGrid, type GridCell } from "@/shared/day-hour-grid/day-hour-grid";
import { Cell } from "@/shared/ui/cell/cell";
import type { Run } from "../domain/best-time";
import { heatCellOf } from "../domain/heat";
import type { FinalTime, Results } from "../server/results-schema";
import { useBumpOnRise } from "./use-bump-on-rise";
import { useFillIn } from "./use-fill-in";

type HeatmapProps = {
  results: Results;
  best?: Run;
  isSelected: (cell: GridCell) => boolean;
  onCellTap: (cell: GridCell) => void;
};

type HeatCellProps = ReturnType<typeof heatCellOf> & {
  label: string;
  tabIndex: 0 | -1;
  respondentCount: number;
  chosen?: string;
  fillOrder?: number;
};

function HeatCell({ count, heat, everyone, best, label, tabIndex, respondentCount, chosen, fillOrder }: HeatCellProps) {
  const ref = useBumpOnRise<HTMLButtonElement>(count);
  useFillIn(ref, chosen, fillOrder);

  return (
    <Cell ref={ref} heat={heat} everyone={everyone} best={best} aria-label={`${label}, ${count} z ${respondentCount} może`} tabIndex={tabIndex}>
      {count > 0 && count}
    </Cell>
  );
}

function chosenKey(final: FinalTime | null) {
  return final ? `${final.date} ${final.firstHour}–${final.lastHour}` : undefined;
}

function fillOrderOf(final: FinalTime | null, { date, hour }: GridCell) {
  if (!final || date !== final.date || hour < final.firstHour || hour >= final.lastHour) return undefined;
  return hour - final.firstHour;
}

export function Heatmap({ results, best, isSelected, onCellTap }: HeatmapProps) {
  return (
    <DayHourGrid
      label="Kto może"
      dates={results.dates}
      hours={results.hours}
      isSelected={isSelected}
      renderCell={({ label, tabIndex, date, hour }) => (
        <HeatCell
          {...heatCellOf(results.respondents, { date, hour }, results.final ?? best)}
          chosen={chosenKey(results.final)}
          fillOrder={fillOrderOf(results.final, { date, hour })}
          label={label}
          tabIndex={tabIndex}
          respondentCount={results.respondents.length}
        />
      )}
      onCellTap={onCellTap}
    />
  );
}
