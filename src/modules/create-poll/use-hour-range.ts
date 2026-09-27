import { useState } from "react";
import { endBounds, hourRanges, startBounds, withEnd, withStart, type HourRange } from "./hour-range";

export type RangeChoice = keyof typeof hourRanges | "custom";

export function useHourRange() {
  const [choice, setChoice] = useState<RangeChoice>("evening");
  const [custom, setCustom] = useState<HourRange>(hourRanges.evening);

  return {
    choice,
    choose: setChoice,
    range: choice === "custom" ? custom : hourRanges[choice],
    custom,
    startBounds,
    endBounds: endBounds(custom),
    setStart: (start: number) => setCustom((range) => withStart(range, start)),
    setEnd: (end: number) => setCustom((range) => withEnd(range, end)),
  };
}

export type HourRangeState = ReturnType<typeof useHourRange>;
