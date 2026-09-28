import { Card } from "@/shared/ui/card/card";
import { heatScene } from "../../../domain/heat-scene";
import type { SceneProps } from "../story-steps";
import { HeatCell, PeoplePill, PollGrid, PollHead, Tabs } from "./poll-parts";

const hours = [17, 18, 19, 20, 21, 22];

export function HeatGrid({ time }: SceneProps) {
  const scene = heatScene(time);
  const joined = scene.people.filter((person) => person.joined).map((person) => person.name);

  return (
    <>
      <PollHead line="Kuba pyta" aside={<PeoplePill names={joined} count={scene.count} />} />
      <Tabs selected="Wszyscy" />
      <Card>
        <p className="m-0 mb-3 text-sm text-muted">Kliknij godzinę, żeby zobaczyć, kto może.</p>
        <PollGrid days={scene.days} hours={hours} cell={(row, column) => <HeatCell {...scene.rows[row].cells[column]} />} />
      </Card>
    </>
  );
}
