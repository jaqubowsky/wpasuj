import { useState } from "react";
import { defaultRange, withEnd, withStart, withTiles } from "../domain/hour-range";

export function useHourRange() {
  const [range, setRange] = useState(defaultRange);
  const [pickingEnd, setPickingEnd] = useState(false);

  return {
    range,
    pickingEnd,
    setStart: (firstHour: number) => setRange((current) => withStart(current, firstHour)),
    setEnd: (endHour: number) => setRange((current) => withEnd(current, endHour)),
    pickTile: (hour: number) => {
      const tiled = withTiles(range.firstHour, hour);
      if (pickingEnd && tiled.hourCount >= 1) {
        setRange(tiled);
        setPickingEnd(false);
        return;
      }
      setRange({ firstHour: hour, hourCount: 1 });
      setPickingEnd(true);
    },
  };
}

export type HourRangeState = ReturnType<typeof useHourRange>;
