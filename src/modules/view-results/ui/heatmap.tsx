import { DayHourGrid, type GridCell } from "@/shared/day-hour-grid/day-hour-grid";
import { Cell } from "@/shared/ui/cell/cell";
import { heatCellOf } from "../domain/heat";
import type { Results } from "../server/results-schema";
import { useBumpOnRise } from "./use-bump-on-rise";

type HeatmapProps = {
  results: Results;
  isSelected: (cell: GridCell) => boolean;
  onCellTap: (cell: GridCell) => void;
};

type HeatCellProps = ReturnType<typeof heatCellOf> & {
  label: string;
  selected: boolean;
  tabIndex: 0 | -1;
  respondentCount: number;
};

function HeatCell({ count, heat, label, selected, tabIndex, respondentCount }: HeatCellProps) {
  const ref = useBumpOnRise<HTMLButtonElement>(count);

  return (
    <Cell ref={ref} heat={heat} selected={selected} aria-label={`${label}, ${count} z ${respondentCount} może`} tabIndex={tabIndex}>
      {count > 0 && count}
    </Cell>
  );
}

export function Heatmap({ results, isSelected, onCellTap }: HeatmapProps) {
  return (
    <DayHourGrid
      label="Kto może"
      dates={results.dates}
      hours={results.hours}
      isSelected={isSelected}
      renderCell={({ label, selected, tabIndex, date, hour }) => (
        <HeatCell
          {...heatCellOf(results.respondents, { date, hour })}
          label={label}
          selected={selected}
          tabIndex={tabIndex}
          respondentCount={results.respondents.length}
        />
      )}
      onCellTap={onCellTap}
    />
  );
}
