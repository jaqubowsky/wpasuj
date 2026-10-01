"use client";

import { DayHourGrid } from "@/shared/day-hour-grid/day-hour-grid";
import { Board } from "@/shared/ui/board/board";
import { Button } from "@/shared/ui/button/button";
import { Cell } from "@/shared/ui/cell/cell";
import { Icon } from "@/shared/ui/icon/icon";
import { TextLink } from "@/shared/ui/text-link/text-link";
import { useAnswerContext } from "./answer-provider";

export function AnswerBody() {
  const answer = useAnswerContext();

  return (
    <div className="grid gap-2">
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
            {answer.saidCant && <Icon name="check" />}
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
      {answer.invitesOwnPoll && (
        <p className="m-0 text-center">
          <TextLink href="/">
            Też coś planujesz? Zrób własną ankietę
            <span aria-hidden className="ps-1">
              →
            </span>
          </TextLink>
        </p>
      )}
    </div>
  );
}
