"use client";

import { DayHourGrid } from "@/shared/day-hour-grid/day-hour-grid";
import { Button } from "@/shared/ui/button/button";
import { Cell } from "@/shared/ui/cell/cell";
import { Text } from "@/shared/ui/text/text";
import "./answer-body.css";
import { useAnswerContext } from "./answer-provider";

function Check() {
  return (
    <span className="grid size-5 flex-none place-items-center rounded-pill bg-accent text-ink" aria-hidden="true">
      <svg className="size-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.5 6.2 5 8.5 9.5 3.5" />
      </svg>
    </span>
  );
}

export function AnswerBody() {
  const answer = useAnswerContext();

  return (
    <div className="pt-5">
      <Text as="h2" variant="heading">
        Kiedy możesz?
      </Text>
      <p className="mt-2 mb-3 text-note text-muted">Kliknij godziny, kiedy możesz. Możesz też przeciągnąć.</p>
      <DayHourGrid
        label="Kiedy możesz?"
        dates={answer.dates}
        hours={answer.hours}
        isSelected={answer.isMine}
        renderCell={({ selected, label, tabIndex, preview }) => (
          <Cell state={preview ?? (selected ? "mine" : undefined)} aria-label={label} tabIndex={tabIndex} />
        )}
        onCellTap={answer.tapCell}
        onDateTap={answer.tapDate}
        onHourTap={answer.tapHour}
        onStroke={answer.stroke}
      />
      {answer.holdsRow && !answer.justSaidCant && (
        <p className="mt-4 mb-[0] text-note text-muted">
          {answer.canMakeIt ? "Gotowe." : "Nie możesz w żadnym terminie."} Zmieniasz zdanie? Po prostu kliknij.
        </p>
      )}
      <button
        type="button"
        className="mx-auto mt-3 mb-[0] flex min-h-target cursor-pointer items-center gap-2 rounded-pill border-0 bg-transparent px-4 py-[0] font-sans text-note font-medium text-muted underline decoration-edge underline-offset-3 transition-transform duration-(--duration-fill) ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink aria-pressed:bg-ink aria-pressed:text-surface aria-pressed:no-underline motion-safe:active:scale-97"
        aria-pressed={answer.saidCant}
        onClick={answer.saidCant ? answer.undoCant : answer.cantMakeAny}
      >
        {answer.saidCant && <Check />}
        Nie mogę w żadnym terminie
      </button>
      {answer.justSaidCant && (
        <div className="mt-2 flex flex-col items-center text-center" data-answer-declined>
          <p className="m-[0] text-caption font-medium">Nie możesz w żadnym terminie.</p>
          <p className="m-[0] mt-1 text-label text-muted">Organizator zobaczy Twoją odpowiedź.</p>
          <Button variant="text" onClick={answer.undoCant}>
            Cofnij
          </Button>
        </div>
      )}
    </div>
  );
}
