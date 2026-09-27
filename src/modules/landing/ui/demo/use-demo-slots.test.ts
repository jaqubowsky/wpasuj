import { act, renderHook } from "@testing-library/react";
import { expect, it } from "vitest";
import { useDemoSlots } from "./use-demo-slots";

const friday = "2025-10-17";
const at = (hour: number) => ({ date: friday, hour });

function markedHours(isMine: (cell: { date: string; hour: number }) => boolean) {
  return [18, 19, 20, 21, 22].filter((hour) => isMine(at(hour)));
}

it("merges an adding stroke over a tapped hour and cuts a removing stroke out of it", () => {
  const { result } = renderHook(() => useDemoSlots());

  act(() => result.current.tap(at(19)));
  act(() => result.current.stroke({ dates: [friday], hours: [19, 20, 21], mode: "add" }));

  expect(markedHours(result.current.isMine)).toEqual([19, 20, 21]);
  expect(result.current.mine).toHaveLength(3);

  act(() => result.current.stroke({ dates: [friday], hours: [20], mode: "remove" }));

  expect(markedHours(result.current.isMine)).toEqual([19, 21]);
});

it("clears every hour", () => {
  const { result } = renderHook(() => useDemoSlots());
  act(() => result.current.stroke({ dates: [friday], hours: [18, 19], mode: "add" }));

  act(() => result.current.clear());

  expect(result.current.mine).toEqual([]);
});
