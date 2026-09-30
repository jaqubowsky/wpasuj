"use client";

import { Icon } from "@/shared/ui/icon/icon";
import { lazy, Suspense, useRef, type CSSProperties } from "react";
import { useBottomBarLift } from "./use-bottom-bar-lift";
import { useReportProblem } from "./use-report-problem";

const ReportForm = lazy(() => import("./report-form"));

export function ReportProblem() {
  const report = useReportProblem();
  const lift = useBottomBarLift();
  const pill = useRef<HTMLButtonElement>(null);

  return (
    <>
      <div className="pb-[calc(--spacing(19)+env(safe-area-inset-bottom))]" aria-hidden="true" data-report-room />
      <div
        className="fixed right-4 bottom-(--report-bottom) z-2 flex flex-col items-end gap-2"
        style={{ "--report-bottom": `max(calc(var(--spacing) * 4 + env(safe-area-inset-bottom)), ${lift + 12}px)` } as CSSProperties}
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
        <Suspense>
          <ReportForm report={report} pill={pill} />
        </Suspense>
      )}
    </>
  );
}
