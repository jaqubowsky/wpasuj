"use client";

import { Avatar } from "@/shared/ui/avatar/avatar";
import { Button } from "@/shared/ui/button/button";
import { Input } from "@/shared/ui/input/input";
import { Status } from "@/shared/ui/status/status";
import Link from "next/link";
import { useId, type ReactNode } from "react";
import { useAnswerContext } from "./answer-provider";
import { clashLine, mergeLine } from "../domain/clash-line";
import { maxNameLength, nameKey } from "../domain/name-rules";

const notices: Record<"closed" | "full" | "gone", ReactNode> = {
  closed: "Termin jest już ustalony, odpowiedzi są zamknięte.",
  full: "W tej ankiecie jest już 30 osób, więcej się nie zmieści. Napisz na grupie, kiedy możesz.",
  gone: (
    <>
      Tej ankiety już nie ma.{" "}
      <Link href="/" className="text-inherit underline-offset-3">
        Zrób własną ankietę
      </Link>
    </>
  ),
};

function NameClash({
  heldName,
  hours,
  yours,
  onClaim,
  onDecline,
}: {
  heldName: string;
  hours?: number;
  yours?: { name: string; hours: number };
  onClaim: () => void;
  onDecline?: () => void;
}) {
  const headingId = useId();

  return (
    <section className="grid gap-4 rounded-card bg-surface p-5" aria-labelledby={headingId}>
      <div className="flex items-center gap-3">
        <Avatar name={heldName} tintKey={nameKey(heldName)} />
        <div className="grid">
          <h2 id={headingId} className="m-0 text-lg font-semibold">
            To Ty, {heldName}?
          </h2>
          {hours !== undefined && <span className="text-sm text-muted">{clashLine(hours)}</span>}
          {yours && <span className="text-sm text-muted">{mergeLine(yours)}</span>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="primary" block onClick={onClaim}>
          Tak, to ja
        </Button>
        {onDecline && (
          <Button block onClick={onDecline}>
            To nie ja
          </Button>
        )}
      </div>
    </section>
  );
}

export function AnswerStatus() {
  return <Status state={useAnswerContext().saveState} />;
}

export function AnswerLead() {
  const { attachNameField, ...answer } = useAnswerContext();
  const { problem } = answer;

  return (
    <div className="grid gap-3 empty:hidden">
      {answer.asksName && (
        <Input
          ref={attachNameField}
          label="Twoje imię"
          labelAside={<Status state={answer.saveState} />}
          variant="compact"
          autoComplete="given-name"
          enterKeyHint="done"
          maxLength={maxNameLength}
          value={answer.name}
          onChange={(event) => answer.rename(event.target.value)}
          error={problem?.kind === "invalid" ? "Wpisz swoje imię, żeby zapisać" : undefined}
        />
      )}
      {answer.saveState === "failed" && problem === undefined && (
        <div className="flex justify-end">
          <Button variant="text" onClick={answer.retry}>
            Spróbuj ponownie
          </Button>
        </div>
      )}
      {problem?.kind === "organiser-name" && (
        <p className="m-0 flex items-center gap-2 text-base" role="alert">
          <Avatar name={answer.name} tintKey={nameKey(answer.name)} />
          Tak ma na imię organizator. Wpisz swoje.
        </p>
      )}
      {problem?.kind === "name-taken" && (
        <NameClash
          heldName={problem.heldName}
          hours={problem.hours}
          yours={problem.yours}
          onClaim={() => answer.claim(problem.heldName)}
          onDecline={answer.asksName ? answer.declineClaim : undefined}
        />
      )}
      {(problem?.kind === "closed" || problem?.kind === "full" || problem?.kind === "gone") && (
        <p className="m-0 text-sm font-medium text-accent-ink" role="alert">
          {notices[problem.kind]}
        </p>
      )}
    </div>
  );
}
