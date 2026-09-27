import { settledAt } from "../../../domain/best-scene";
import type { SceneProps } from "../story-steps";
import { BestTimePoll } from "./best-time";

export function Settled({ time }: SceneProps) {
  return <BestTimePoll {...settledAt(time)} />;
}
