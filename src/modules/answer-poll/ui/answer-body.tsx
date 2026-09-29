"use client";

import { DayHourGrid } from "@/shared/day-hour-grid/day-hour-grid";
import { Board } from "@/shared/ui/board/board";
import { Button } from "@/shared/ui/button/button";
import { Cell } from "@/shared/ui/cell/cell";
import { useAnswerContext } from "./answer-provider";

export function AnswerBody() {
  const answer = useAnswerContext();

  return (
    <Board>
      <div className="grid text-base text-muted">
        {answer.asksToMark && <p className="m-0">Zaznacz też swoje godziny.</p>}
        <p className="m-0">
          Kliknij godziny, kiedy możesz. <span className="pointer-coarse:hidden">Możesz przeciągnąć.</span>
          <span className="hidden pointer-coarse:inline">Przytrzymaj, żeby przeciągnąć.</span>
        </p>
      </div>
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
      {!answer.asksToMark && (
        <Button block aria-pressed={answer.saidCant} onClick={answer.saidCant ? answer.undoCant : answer.cantMakeAny}>
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
        </Button>
      )}
      {answer.justSaidCant && (
        <div className="flex justify-center">
          <Button variant="text" onClick={answer.undoCant}>
            Cofnij
          </Button>
        </div>
      )}
    </Board>
  );
}
