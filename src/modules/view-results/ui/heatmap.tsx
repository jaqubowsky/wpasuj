import { DayHourGrid, type GridCell } from "@/shared/day-hour-grid/day-hour-grid";
import { Cell } from "@/shared/ui/cell/cell";
import { Text } from "@/shared/ui/text/text";
import type { Run } from "../domain/best-time";
import { heatCellOf } from "../domain/heat";
import "./heatmap.css";
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

const ramp = [1, 2, 3, 4, 5];

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
    <section className="lg:rounded-card lg:bg-surface lg:pt-5 lg:pr-6 lg:pb-6 lg:pl-3" data-heatmap>
      <div className="mb-[10px] flex items-center justify-between gap-3">
        <Text variant="meta">Kliknij godzinę, żeby zobaczyć, kto może</Text>
        <span className="flex flex-none gap-[3px]" aria-hidden>
          {ramp.map((heat) => (
            <span key={heat} className="h-[10px] w-[18px] rounded-[3px] data-[heat=1]:bg-heat-1 data-[heat=2]:bg-heat-2 data-[heat=3]:bg-heat-3 data-[heat=4]:bg-heat-4 data-[heat=5]:bg-heat-5" data-heat={heat} />
          ))}
        </span>
      </div>
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
    </section>
  );
}
