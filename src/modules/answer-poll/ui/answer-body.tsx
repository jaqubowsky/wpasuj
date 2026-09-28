"use client";

import { DayHourGrid } from "@/shared/day-hour-grid/day-hour-grid";
import { Button } from "@/shared/ui/button/button";
import { Cell } from "@/shared/ui/cell/cell";
import { useAnswerContext } from "./answer-provider";

export function AnswerBody() {
  const answer = useAnswerContext();

  return (
    <section className="grid gap-3 rounded-card bg-surface p-4 lg:gap-4 lg:p-6">
      {answer.asksToMark ? (
        <p className="m-0 flex h-12 items-center text-base text-muted">Zaznacz też swoje godziny.</p>
      ) : (
        <button
          type="button"
          className="box-border flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-control border-0 bg-surface font-sans text-base font-semibold text-ink shadow-[inset_0_0_0_1px_var(--color-edge)] transition-transform duration-(--duration-fill) ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink aria-pressed:bg-ink aria-pressed:text-surface aria-pressed:shadow-none motion-safe:active:scale-97"
          aria-pressed={answer.saidCant}
          onClick={answer.saidCant ? answer.undoCant : answer.cantMakeAny}
        >
          {answer.saidCant && (
            <svg
              className="size-4.5 flex-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          )}
          Nie mogę w żadnym terminie
        </button>
      )}
      <div
        className="transition-opacity duration-(--duration-fill) ease-out data-faded:opacity-45"
        data-faded={answer.saidCant || undefined}
      >
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
          morphDates
        />
      </div>
      {answer.justSaidCant ? (
        <div className="flex justify-center">
          <Button variant="text" onClick={answer.undoCant}>
            Cofnij
          </Button>
        </div>
      ) : (
        <p className="m-0 text-center text-sm text-muted">Kliknij godziny, kiedy możesz. Możesz przeciągnąć.</p>
      )}
    </section>
  );
}
