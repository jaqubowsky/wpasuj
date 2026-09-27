import type { GridCell, PaintedRectangle } from "@/shared/day-hour-grid/use-paint-stroke";
import { readLastName, rememberName, useLastName } from "@/shared/last-name";
import { useEffect, useRef, useState } from "react";
import { claimName, saveAnswer, type ClaimRefusal } from "../server/answer-actions";
import type { Slot } from "../server/answer-schema";
import { clearingStepMs } from "../domain/clearing";
import { normaliseName } from "../domain/name-rules";
import { useAutosave } from "./use-autosave";

export type Answer = { name: string; slots: Slot[] };
export type Problem = { kind: "name-taken"; heldName: string } | { kind: "invalid" | "closed" | "full" | "gone" };

type AnswerOptions = { pollId: string; dates: string[]; hours: number[]; mine?: Answer };

const keyOf = ({ date, hour }: GridCell) => `${date} ${hour}`;

const hourOf = (key: string) => Number(key.split(" ")[1]);

const inReadingOrder = (a: string, b: string) => hourOf(a) - hourOf(b) || a.localeCompare(b);

function slotsOf(keys: Set<string>): Slot[] {
  return [...keys]
    .map((key) => {
      const [date, hour] = key.split(" ");
      return { date, hour: Number(hour) };
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.hour - b.hour);
}

function afterRefusedClaim(reason: ClaimRefusal): "save-as-newcomer" | Problem {
  switch (reason) {
    case "invalid":
      return "save-as-newcomer";
    case "closed":
    case "gone":
      return { kind: reason };
  }
}

export function useAnswer({ pollId, dates, hours, mine }: AnswerOptions) {
  const lastName = useLastName();
  const [typedName, setTypedName] = useState(mine?.name);
  const [mySlots, setMySlots] = useState(() => new Set(mine?.slots.map(keyOf)));
  const slotsRef = useRef(mySlots);
  const [holdsRow, setHoldsRow] = useState(mine !== undefined);
  const [beforeCant, setBeforeCant] = useState<Set<string>>();
  const [cantTurnedOff, setCantTurnedOff] = useState(false);
  const clearing = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [problem, setProblem] = useState<Problem>();
  const nameRef = useRef<HTMLInputElement>(null);
  const name = typedName ?? lastName;
  const newHere = mine === undefined;

  useEffect(() => {
    if (newHere && readLastName() === "") nameRef.current?.focus();
  }, [newHere]);

  async function send(answer: Answer) {
    let result = await saveAnswer(pollId, answer);
    if (!result.ok && result.reason === "not-yours") {
      setHoldsRow(false);
      result = await saveAnswer(pollId, answer);
    }
    if (result.ok) {
      setHoldsRow(true);
      setProblem(undefined);
      rememberName(normaliseName(answer.name));
      return true;
    }
    switch (result.reason) {
      case "name-taken":
        setProblem({ kind: "name-taken", heldName: result.name });
        return false;
      case "not-yours":
        setProblem({ kind: "name-taken", heldName: normaliseName(answer.name) });
        return false;
      case "invalid":
      case "closed":
      case "full":
      case "gone":
        setProblem({ kind: result.reason });
        return false;
    }
  }

  const autosave = useAutosave(send, mine ? "saved" : undefined);

  function stopClearing() {
    clearing.current.forEach(clearTimeout);
    clearing.current = [];
  }

  useEffect(() => stopClearing, []);

  function replaceSlots(next: Set<string>, answerName = name) {
    stopClearing();
    setBeforeCant(undefined);
    slotsRef.current = next;
    setMySlots(next);
    autosave.schedule({ name: answerName, slots: slotsOf(next) });
  }

  function paint(cells: GridCell[], add: boolean) {
    const next = new Set(slotsRef.current);
    for (const cell of cells) {
      if (add) next.add(keyOf(cell));
      else next.delete(keyOf(cell));
    }
    replaceSlots(next);
  }

  function cantMakeAny() {
    const before = slotsRef.current;
    replaceSlots(new Set());
    setBeforeCant(before);
    setCantTurnedOff(false);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const order = [...before].sort(inReadingOrder);
    const showFrom = (index: number) => setMySlots(new Set(order.slice(index)));
    const step = clearingStepMs(order.length);
    showFrom(1);
    clearing.current = order.slice(1).map((_, index) => setTimeout(() => showFrom(index + 2), (index + 1) * step));
  }

  function toggleAll(cells: GridCell[]) {
    paint(cells, !cells.every((cell) => slotsRef.current.has(keyOf(cell))));
  }

  return {
    dates,
    hours,
    name,
    attachNameField: (field: HTMLInputElement | null) => {
      nameRef.current = field;
    },
    saveState: autosave.state,
    problem,
    holdsRow,
    canMakeIt: mySlots.size > 0,
    saidCant: beforeCant !== undefined || (holdsRow && mySlots.size === 0 && !cantTurnedOff),
    justSaidCant: beforeCant !== undefined,
    isMine: (cell: GridCell) => mySlots.has(keyOf(cell)),
    rename(next: string) {
      setTypedName(next);
      if (autosave.state !== undefined) autosave.schedule({ name: next, slots: slotsOf(slotsRef.current) });
    },
    tapCell: (cell: GridCell) => toggleAll([cell]),
    tapDate: (date: string) => toggleAll(hours.map((hour) => ({ date, hour }))),
    tapHour: (hour: number) => toggleAll(dates.map((date) => ({ date, hour }))),
    stroke: ({ dates: strokeDates, hours: strokeHours, mode }: PaintedRectangle) =>
      paint(
        strokeDates.flatMap((date) => strokeHours.map((hour) => ({ date, hour }))),
        mode === "add",
      ),
    cantMakeAny,
    undoCant: () => (beforeCant ? replaceSlots(beforeCant) : setCantTurnedOff(true)),
    retry: autosave.retry,
    async claim(heldName: string) {
      const result = await claimName(pollId, heldName);
      if (result.ok) {
        setProblem(undefined);
        setTypedName(result.name);
        replaceSlots(new Set([...slotsRef.current, ...result.slots.map(keyOf)]), result.name);
        return;
      }
      const next = afterRefusedClaim(result.reason);
      setProblem(next === "save-as-newcomer" ? undefined : next);
      if (next === "save-as-newcomer") autosave.retry();
    },
    declineClaim() {
      setProblem(undefined);
      nameRef.current?.focus();
    },
  };
}
