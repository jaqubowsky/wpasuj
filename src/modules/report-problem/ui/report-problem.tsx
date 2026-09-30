"use client";

import { Button } from "@/shared/ui/button/button";
import { Icon } from "@/shared/ui/icon/icon";
import { Input } from "@/shared/ui/input/input";
import { Sheet } from "@/shared/ui/sheet/sheet";
import { useId, useRef, type CSSProperties } from "react";
import "./report-problem.css";
import { useBottomBarLift } from "./use-bottom-bar-lift";
import { useReportProblem } from "./use-report-problem";

const mail = (
  <a className="font-semibold text-ink underline underline-offset-3" href="mailto:kontakt@wpasuj.pl">
    kontakt@wpasuj.pl
  </a>
);

export function ReportProblem() {
  const report = useReportProblem();
  const lift = useBottomBarLift();
  const pill = useRef<HTMLButtonElement>(null);
  const textId = useId();
  const textErrorId = useId();

  return (
    <>
      <div className="pb-[calc(--spacing(19)+env(safe-area-inset-bottom))]" aria-hidden="true" data-report-room />
      <div
        className="fixed right-4 z-2 flex flex-col items-end gap-2"
        style={{ "--report-lift": `${lift}px` } as CSSProperties}
        data-report-pill
      >
        {report.status === "thanked" && (
          <p className="m-0 rounded-control bg-ink px-4 py-3 text-sm font-semibold text-surface" role="status">
            Dzięki, zgłoszenie dotarło.
          </p>
        )}
        <button
          ref={pill}
          type="button"
          className="box-border inline-flex h-11 cursor-pointer items-center gap-2 rounded-pill border-2 border-solid border-ink bg-paper px-3.5 font-sans text-sm font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink motion-safe:active:scale-97"
          aria-haspopup="dialog"
          onClick={report.open}
        >
          <Icon name="report" />
          Zgłoś problem
        </button>
      </div>
      {report.status !== "closed" && report.status !== "thanked" && (
        <Sheet label="Zgłoś problem" menuAbove={pill} onClose={report.close}>
          <form
            className="flex flex-col gap-5 lg:p-3"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              report.submit();
            }}
          >
            <div className="flex flex-col gap-2">
              <label htmlFor={textId} className="font-display text-lg font-bold tracking-tight normal-nums">
                Co nie działa?
              </label>
              <textarea
                id={textId}
                className="box-border min-h-30 w-full resize-y rounded-control border-0 bg-surface px-4 py-3.5 font-sans text-base font-medium text-ink shadow-[inset_0_0_0_1px_var(--color-edge)] placeholder:text-muted focus:shadow-[inset_0_0_0_2px_var(--color-ink)] focus:outline-none aria-invalid:not-focus:shadow-[inset_0_0_0_2px_var(--color-accent-ink)]"
                placeholder="Np. nie mogę zaznaczyć godzin na telefonie"
                value={report.text}
                onChange={(event) => report.setText(event.target.value)}
                aria-invalid={report.textError ? true : undefined}
                aria-describedby={report.textError ? textErrorId : undefined}
              />
              {report.textError && (
                <small id={textErrorId} className="text-sm font-medium text-accent-ink">
                  {report.textError}
                </small>
              )}
            </div>
            <Input
              label="Jak się z tobą skontaktować? (opcjonalnie)"
              placeholder="E-mail albo telefon"
              value={report.contact}
              onChange={(event) => report.setContact(event.target.value)}
              error={report.contactError}
            />
            <div className="sr-only" aria-hidden="true">
              <label>
                Strona internetowa
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  value={report.website}
                  onChange={(event) => report.setWebsite(event.target.value)}
                  name="website"
                />
              </label>
            </div>
            {report.status === "failed" && (
              <p className="m-0 text-sm font-medium text-accent-ink" role="alert">
                Nie udało się wysłać. Napisz na {mail}.
              </p>
            )}
            {report.status === "too-many" && (
              <p className="m-0 text-sm font-medium text-accent-ink" role="alert">
                Za dużo zgłoszeń naraz. Spróbuj za godzinę albo napisz na {mail}.
              </p>
            )}
            <Button type="submit" variant="primary" block aria-busy={report.status === "sending"}>
              {report.status === "sending" ? "Wysyłam…" : "Wyślij zgłoszenie"}
            </Button>
          </form>
        </Sheet>
      )}
    </>
  );
}
