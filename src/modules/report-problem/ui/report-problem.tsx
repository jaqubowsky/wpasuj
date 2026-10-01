"use client";

import { Icon } from "@/shared/ui/icon/icon";
import { lazy, Suspense, useRef } from "react";
import { usePillCovered } from "./use-pill-covered";
import { useReportProblem } from "./use-report-problem";
import "./report-problem.css";

const ReportForm = lazy(() => import("./report-form"));

export function ReportProblem() {
  const report = useReportProblem();
  const pill = useRef<HTMLButtonElement>(null);
  const covered = usePillCovered(pill);

  return (
    <>
      <div className="pb-[calc(--spacing(19)+env(safe-area-inset-bottom))]" aria-hidden="true" data-report-room />
      <div
        className="fixed right-4 z-2 flex flex-col items-end gap-2 transition-opacity duration-(--duration-fill) ease-out max-lg:data-covered:pointer-events-none max-lg:data-covered:opacity-0"
        data-report-pill
        data-covered={covered || undefined}
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
