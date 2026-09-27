"use client";

import { DayHourGrid } from "@/shared/day-hour-grid/day-hour-grid";
import { Cell } from "@/shared/ui/cell/cell";
import { Text } from "@/shared/ui/text/text";
import { useAnswerContext } from "./answer-provider";

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
      {answer.holdsRow && (
        <p className="mt-4 mb-[0] text-note text-muted">
          {answer.canMakeIt ? "Gotowe." : "Nie możesz w żadnym terminie."} Zmieniasz zdanie? Po prostu kliknij.
        </p>
      )}
      <button type="button" className="mx-auto mt-3 mb-[0] block min-h-target cursor-pointer border-0 bg-transparent px-4 py-[0] font-sans text-note font-medium text-muted underline decoration-edge underline-offset-3" onClick={answer.cantMakeAny}>
        Nie mogę w żadnym terminie
      </button>
    </div>
  );
}
