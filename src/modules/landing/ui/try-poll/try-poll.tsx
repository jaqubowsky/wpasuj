"use client";

import { Avatar } from "@/shared/ui/avatar/avatar";
import { Fragment } from "react";
import { heatOf, tryDays, tryHours } from "../../domain/try-poll";
import { useTryPoll } from "./use-try-poll";

const answered = ["Ola", "Zuza", "Kuba", "Michał", "Bartek"];

export function TryPoll() {
  const { mine, counts, best, pulses, tap } = useTryPoll();

  return (
    <div className="relative box-border grid gap-3.5 rounded-card bg-surface p-5.5 shadow-poster">
      <p className="absolute -top-12 right-2 z-1 m-0 -rotate-4 rounded-pill bg-ink px-4 py-2 text-base font-semibold text-paper lg:right-6.5">
        Śmiało, klikaj
        <svg className="absolute top-8.5 right-4.5 stroke-ink" fill="none" width="34" height="40" viewBox="0 0 34 40" aria-hidden="true">
          <path d="M4 2 C 8 18, 18 26, 28 34" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M20 34 L28 34 L27 26" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </p>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <b className="font-display text-2xl font-extrabold tracking-tight">Planszówki u Michała</b>
        <div className="flex gap-0.5">
          {answered.map((name) => (
            <Avatar key={name} name={name} tintKey={name.toLocaleLowerCase("pl")} />
          ))}
          <Avatar name="Ty" tintKey="ty" you />
        </div>
      </div>
      <div className="grid grid-cols-[--spacing(11.5)_repeat(4,minmax(0,1fr))] gap-1.5 lg:grid-cols-[--spacing(14.5)_repeat(4,minmax(0,1fr))] lg:gap-2">
        <span />
        {tryDays.map((day) => (
          <span key={day.short} className="text-center text-sm font-semibold">
            {day.short}
          </span>
        ))}
        {tryHours.map((hour, hourIndex) => (
          <Fragment key={hour}>
            <span className="self-center text-sm text-muted">{hour}</span>
            {tryDays.map((day, dayIndex) => {
              const count = counts[hourIndex][dayIndex];
              const heat = heatOf(count);

              return (
                <button
                  key={day.short}
                  type="button"
                  className="h-11 cursor-pointer rounded-cell border-0 bg-surface font-sans text-base font-semibold text-ink shadow-[inset_0_0_0_1px_var(--color-edge)] transition-[background] duration-(--duration-fill) ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink aria-pressed:shadow-[inset_0_0_0_3px_var(--color-ink)] data-heat:not-aria-pressed:shadow-none data-[heat=1]:bg-heat-1 data-[heat=2]:bg-heat-2 data-[heat=3]:bg-heat-3 data-[heat=4]:bg-heat-4 data-[heat=5]:bg-heat-5 data-[heat=5]:text-surface motion-safe:active:scale-96 lg:h-12"
                  aria-label={`${day.long}, ${hour}, ${count} z 6`}
                  aria-pressed={mine[hourIndex][dayIndex]}
                  data-heat={heat || undefined}
                  onClick={() => tap(hourIndex, dayIndex)}
                >
                  {count || ""}
                </button>
              );
            })}
          </Fragment>
        ))}
      </div>
      <div role="status" className="group" data-pulse={pulses > 0 || undefined}>
        <div
          key={pulses}
          className="flex items-center justify-between gap-3 rounded-card bg-ink px-4.5 py-3.5 text-paper group-data-pulse:animate-pulse"
        >
          <div>
            <small className="block text-xs text-on-dark-muted">Najlepiej teraz</small>
            <strong className="font-display text-2xl font-extrabold tracking-tight">{best.label}</strong>
          </div>
          <span className="text-base font-semibold whitespace-nowrap text-heat-3">{best.count} z 6</span>
        </div>
      </div>
    </div>
  );
}
