"use client";

import { DayHourGrid } from "@/shared/day-hour-grid/day-hour-grid";
import { Cell } from "@/shared/ui/cell/cell";
import { Text } from "@/shared/ui/text/text";
import styles from "./answer.module.css";
import { useAnswerContext } from "./answer-provider";

export function AnswerBody() {
  const answer = useAnswerContext();

  return (
    <div className={styles.body}>
      <Text as="h2" variant="heading">
        Kiedy możesz?
      </Text>
      <p className={styles.hint}>Kliknij godziny, kiedy możesz. Możesz też przeciągnąć.</p>
      <DayHourGrid
        label="Kiedy możesz?"
        dates={answer.dates}
        hours={answer.hours}
        isSelected={answer.isMine}
        renderCell={({ label, tabIndex, preview, ...cell }) => {
          const mine = answer.isMine(cell);
          return <Cell pressed={mine} state={preview ?? (mine ? "mine" : undefined)} aria-label={label} tabIndex={tabIndex} />;
        }}
        onCellTap={answer.tapCell}
        onDateTap={answer.tapDate}
        onHourTap={answer.tapHour}
        onStroke={answer.stroke}
      />
      {answer.holdsRow && (
        <p className={styles.done}>
          {answer.canMakeIt ? "Gotowe." : "Nie możesz w żadnym terminie."} Zmieniasz zdanie? Po prostu kliknij.
        </p>
      )}
      <button type="button" className={styles.cant} onClick={answer.cantMakeAny}>
        Nie mogę w żadnym terminie
      </button>
    </div>
  );
}
