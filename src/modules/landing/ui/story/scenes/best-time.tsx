import { Card } from "@/shared/ui/card/card";
import { bestPoll, bestTimeAt } from "../../../domain/best-scene";
import type { SceneProps } from "../story-steps";
import { HeatCell, PeoplePill, PollGrid, PollHead, Tabs } from "./poll-parts";

export function BestTime({ time }: SceneProps) {
  const risen = bestTimeAt(time);

  return (
    <>
      <PollHead line="Kuba pyta" aside={<PeoplePill names={bestPoll.people} count={bestPoll.count} />} />
      <div
        data-risen={risen || undefined}
        className="mb-3 -translate-y-2 opacity-0 transition-[opacity,translate] duration-(--duration-pop) ease-out data-risen:translate-y-0 data-risen:opacity-100"
      >
        <Card tone="ink" label="Najlepiej teraz">
          <p className="m-0 mt-1 font-display text-2xl font-bold tracking-tightest">{bestPoll.best}</p>
        </Card>
      </div>
      <Tabs selected="Wszyscy" />
      <Card>
        <PollGrid
          days={bestPoll.days}
          hours={bestPoll.rows.map((row) => row.hour)}
          cell={(row, column) => <HeatCell {...bestPoll.rows[row].cells[column]} />}
        />
      </Card>
    </>
  );
}
