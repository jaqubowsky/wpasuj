import { useState } from "react";
import { defaultRange, withEnd, withStart, withTiles } from "../domain/hour-range";

export function useHourRange() {
  const [range, setRange] = useState(defaultRange);
  const [pickingEnd, setPickingEnd] = useState(false);
  const [hovered, setHovered] = useState<number>();

  return {
    range,
    pickingEnd,
    preview: pickingEnd && hovered !== undefined ? withTiles(range.firstHour, hovered) : undefined,
    setStart: (firstHour: number) => setRange((current) => withStart(current, firstHour)),
    setEnd: (endHour: number) => setRange((current) => withEnd(current, endHour)),
    hoverTile: setHovered,
    pickTile: (hour: number) => {
      setRange(pickingEnd ? withTiles(range.firstHour, hour) : { firstHour: hour, hourCount: 1 });
      setPickingEnd(!pickingEnd);
    },
  };
}

export type HourRangeState = ReturnType<typeof useHourRange>;
