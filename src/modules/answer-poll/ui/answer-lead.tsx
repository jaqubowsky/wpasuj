"use client";

import { Button } from "@/shared/ui/button/button";
import { Input } from "@/shared/ui/input/input";
import { Status } from "@/shared/ui/status/status";
import { Text } from "@/shared/ui/text/text";
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./answer.module.css";
import { useAnswerContext } from "./answer-provider";
import { maxNameLength } from "../domain/name-rules";

const notices: Record<"closed" | "full" | "gone", ReactNode> = {
  closed: "Termin jest już ustalony, odpowiedzi są zamknięte. Zobacz go w zakładce Wszyscy.",
  full: "W tej ankiecie jest już 30 osób, więcej się nie zmieści. Napisz na grupie, kiedy możesz.",
  gone: (
    <>
      Tej ankiety już nie ma. <Link href="/">Zrób nową ankietę</Link>
    </>
  ),
};

export function AnswerLead() {
  const { attachNameField, ...answer } = useAnswerContext();
  const { problem } = answer;

  return (
    <div>
      <div className={styles.name}>
        <Input
          ref={attachNameField}
          label="Jak masz na imię?"
          autoComplete="given-name"
          enterKeyHint="done"
          maxLength={maxNameLength}
          value={answer.name}
          onChange={(event) => answer.rename(event.target.value)}
          error={problem?.kind === "invalid" ? "Wpisz swoje imię, żeby zapisać" : undefined}
        />
        <div className={styles.status}>
          <Status state={answer.saveState} />
        </div>
      </div>
      {answer.saveState === "failed" && problem === undefined && (
        <div className={styles.retry}>
          <Button variant="text" onClick={answer.retry}>
            Spróbuj ponownie
          </Button>
        </div>
      )}
      {problem?.kind === "name-taken" && (
        <div className={styles.claim}>
          <Text as="p" variant="heading">
            To ty, {problem.heldName}?
          </Text>
          <div className={styles.claimActions}>
            <Button variant="primary" onClick={() => answer.claim(problem.heldName)}>
              Tak, to ja
            </Button>
            <Button variant="text" onClick={answer.declineClaim}>
              Nie, zmienię imię
            </Button>
          </div>
        </div>
      )}
      {(problem?.kind === "closed" || problem?.kind === "full" || problem?.kind === "gone") && (
        <p className={styles.notice} role="alert">
          {notices[problem.kind]}
        </p>
      )}
    </div>
  );
}
