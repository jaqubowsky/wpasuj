import { useState } from "react";
import { bestSlot, countsWith, noneMine, toggleMine } from "../../domain/try-poll";

export function useTryPoll() {
  const [mine, setMine] = useState(noneMine);
  const [pulses, setPulses] = useState(0);
  const best = bestSlot(mine);

  const tap = (hour: number, day: number) => {
    const next = toggleMine(mine, hour, day);

    if (bestSlot(next).label !== best.label) setPulses(pulses + 1);

    setMine(next);
  };

  return { mine, counts: countsWith(mine), best, pulses, tap };
}
