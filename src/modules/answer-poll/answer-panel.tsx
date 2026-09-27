"use client";

import { DayHourGrid } from "@/shared/day-hour-grid/day-hour-grid";
import { readLastName } from "@/shared/last-name";
import { Button } from "@/shared/ui/button/button";
import { Cell } from "@/shared/ui/cell/cell";
import { Input } from "@/shared/ui/input/input";
import { Status } from "@/shared/ui/status/status";
import { Text } from "@/shared/ui/text/text";
import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import styles from "./answer-panel.module.css";
import { maxNameLength, normaliseName } from "./name-rules";
import { useAnswer, type Answer, type Problem } from "./use-answer";

type AnswerPanelProps = { pollId: string; dates: string[]; hours: number[]; mine?: Answer };

const notices: Record<Exclude<Problem, "invalid" | "name-taken">, ReactNode> = {
  closed: "Termin jest już ustalony, odpowiedzi są zamknięte. Zobacz go w zakładce Wszyscy.",
  full: "W tej ankiecie jest już 30 osób, więcej się nie zmieści. Napisz na grupie, kiedy możesz.",
  gone: (
    <>
      Tej ankiety już nie ma. <Link href="/">Zrób nową ankietę</Link>
    </>
  ),
};

export function AnswerPanel({ pollId, dates, hours, mine }: AnswerPanelProps) {
  const answer = useAnswer({ pollId, dates, hours, mine });
  const nameRef = useRef<HTMLInputElement>(null);

  const newHere = mine === undefined;

  useEffect(() => {
    if (newHere && readLastName() === "") nameRef.current?.focus();
  }, [newHere]);

  return (
    <div className={styles.panel}>
      <div className={styles.name}>
        <Input
          ref={nameRef}
          label="Jak masz na imię?"
          autoComplete="given-name"
          enterKeyHint="done"
          maxLength={maxNameLength}
          value={answer.name}
          onChange={(event) => answer.rename(event.target.value)}
          error={answer.problem === "invalid" ? "Wpisz swoje imię, żeby zapisać" : undefined}
        />
        {answer.saveState !== "idle" && (
          <div className={styles.status}>
            <Status state={answer.saveState} />
          </div>
        )}
      </div>
      {answer.saveState === "failed" && answer.problem === undefined && (
        <div className={styles.retry}>
          <Button variant="text" onClick={answer.retry}>
            Spróbuj ponownie
          </Button>
        </div>
      )}
      {answer.problem === "name-taken" && (
        <div className={styles.claim}>
          <Text as="p" variant="heading">
            To ty, {normaliseName(answer.name)}?
          </Text>
          <div className={styles.claimActions}>
            <Button variant="primary" onClick={answer.claim}>
              Tak, to ja
            </Button>
            <Button
              variant="text"
              onClick={() => {
                answer.declineClaim();
                nameRef.current?.focus();
              }}
            >
              Nie, zmienię imię
            </Button>
          </div>
        </div>
      )}
      {(answer.problem === "closed" || answer.problem === "full" || answer.problem === "gone") && (
        <p className={styles.notice} role="alert">
          {notices[answer.problem]}
        </p>
      )}
      <p className={styles.hint}>Kliknij godziny, kiedy możesz. Możesz też przeciągnąć.</p>
      <DayHourGrid
        label="Kiedy możesz?"
        dates={dates}
        hours={hours}
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
      {answer.answered && (
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
