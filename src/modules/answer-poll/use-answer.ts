import type { GridCell, PaintedRectangle } from "@/shared/day-hour-grid/use-paint-stroke";
import { rememberName, useLastName } from "@/shared/last-name";
import { useState } from "react";
import { claimName, saveAnswer } from "./answer-actions";
import type { Slot } from "./answer-schema";
import { normaliseName } from "./name-rules";
import { useAutosave } from "./use-autosave";

export type Answer = { name: string; slots: Slot[] };
export type Problem = "invalid" | "name-taken" | "closed" | "full" | "gone";

type AnswerOptions = { pollId: string; dates: string[]; hours: number[]; mine?: Answer };

const keyOf = ({ date, hour }: GridCell) => `${date} ${hour}`;

function slotsOf(keys: Set<string>): Slot[] {
  return [...keys]
    .map((key) => {
      const [date, hour] = key.split(" ");
      return { date, hour: Number(hour) };
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.hour - b.hour);
}

export function useAnswer({ pollId, dates, hours, mine }: AnswerOptions) {
  const lastName = useLastName();
  const [typedName, setTypedName] = useState(mine?.name);
  const [mySlots, setMySlots] = useState(() => new Set(mine?.slots.map(keyOf)));
  const [answered, setAnswered] = useState(mine !== undefined);
  const [problem, setProblem] = useState<Problem>();
  const name = typedName ?? lastName;

  async function send(answer: Answer) {
    let result = await saveAnswer(pollId, answer);
    if (!result.ok && result.reason === "not-yours") result = await saveAnswer(pollId, answer);
    if (result.ok) {
      setAnswered(true);
      setProblem(undefined);
      rememberName(normaliseName(answer.name));
      return true;
    }
    switch (result.reason) {
      case "not-yours":
      case "name-taken":
        setProblem("name-taken");
        return false;
      case "invalid":
      case "closed":
      case "full":
      case "gone":
        setProblem(result.reason);
        return false;
    }
  }

  const autosave = useAutosave(send, mine ? "saved" : "idle");

  function replaceSlots(next: Set<string>) {
    setMySlots(next);
    autosave.schedule({ name, slots: slotsOf(next) });
  }

  function paint(cells: GridCell[], add: boolean) {
    const next = new Set(mySlots);
    for (const cell of cells) {
      if (add) next.add(keyOf(cell));
      else next.delete(keyOf(cell));
    }
    replaceSlots(next);
  }

  function toggleAll(cells: GridCell[]) {
    paint(cells, !cells.every((cell) => mySlots.has(keyOf(cell))));
  }

  return {
    name,
    saveState: autosave.state,
    problem,
    answered,
    canMakeIt: mySlots.size > 0,
    isMine: (cell: GridCell) => mySlots.has(keyOf(cell)),
    rename(next: string) {
      setTypedName(next);
      if (autosave.state !== "idle") autosave.schedule({ name: next, slots: slotsOf(mySlots) });
    },
    tapCell: (cell: GridCell) => toggleAll([cell]),
    tapDate: (date: string) => toggleAll(hours.map((hour) => ({ date, hour }))),
    tapHour: (hour: number) => toggleAll(dates.map((date) => ({ date, hour }))),
    stroke: ({ dates: strokeDates, hours: strokeHours, mode }: PaintedRectangle) =>
      paint(
        strokeDates.flatMap((date) => strokeHours.map((hour) => ({ date, hour }))),
        mode === "add",
      ),
    cantMakeAny: () => replaceSlots(new Set()),
    retry: autosave.retry,
    async claim() {
      const result = await claimName(pollId, normaliseName(name));
      if (result.ok) {
        setProblem(undefined);
        replaceSlots(new Set([...mySlots, ...result.slots.map(keyOf)]));
        return;
      }
      switch (result.reason) {
        case "invalid":
          setProblem(undefined);
          autosave.retry();
          return;
        case "closed":
        case "gone":
          setProblem(result.reason);
          return;
      }
    },
    declineClaim: () => setProblem(undefined),
  };
}
