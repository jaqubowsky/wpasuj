"use client";

import type { FinalTime } from "../server/results-schema";
import { setTimeShown } from "../domain/time-label";
import { useResultsContext } from "./results-provider";
import { useSendSetTime } from "./use-send-set-time";

const notices = {
  copied: "Wiadomość skopiowana. Wklej ją na grupę.",
  "not-copied": "Nie udało się skopiować. Spróbuj jeszcze raz.",
};

export function SetBadge() {
  if (useResultsContext().gone) return null;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill bg-ink px-3 py-1.5 text-sm font-semibold text-surface">
      <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 6 9 17l-5-5" />
      </svg>
      Ustalone
    </span>
  );
}

export function SetTime({ final, title }: { final: FinalTime; title: string }) {
  const { pollId, organiser } = useResultsContext();
  const { notice, send } = useSendSetTime(pollId, title, final);
  const { weekday, day, hours } = setTimeShown(final);
  const calendarAction = (
    <a
      className="box-border inline-flex h-12 items-center justify-center gap-2 rounded-control px-6 font-sans text-base font-semibold text-surface no-underline shadow-[inset_0_0_0_1px_var(--color-muted)] transition-transform duration-(--duration-fill) ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface motion-safe:active:scale-97 data-[emphasis=primary]:h-13 data-[emphasis=primary]:bg-surface data-[emphasis=primary]:text-ink data-[emphasis=primary]:shadow-none lg:h-13"
      data-emphasis={organiser ? undefined : "primary"}
      href={`/e/${pollId}/termin.ics`}
      download
    >
      {!organiser && (
        <svg className="size-4.5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18M12 14v4M10 16h4" />
        </svg>
      )}
      Dodaj do kalendarza
    </a>
  );
  const sendAction = (
    <button
      type="button"
      className="box-border inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-control border-0 bg-transparent px-6 font-sans text-base font-semibold text-surface shadow-[inset_0_0_0_1px_var(--color-muted)] transition-transform duration-(--duration-fill) ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface motion-safe:active:scale-97 data-[emphasis=primary]:h-13 data-[emphasis=primary]:bg-surface data-[emphasis=primary]:text-ink data-[emphasis=primary]:shadow-none lg:h-13"
      data-emphasis={organiser ? "primary" : undefined}
      onClick={send}
    >
      Wyślij termin na grupę
    </button>
  );

  return (
    <section aria-label="Termin" className="grid gap-4 rounded-card bg-ink px-5 pt-6 pb-5 text-surface lg:gap-6 lg:p-10">
      <p className="m-0 grid gap-1 lg:gap-2">
        <span className="text-sm text-on-dark-muted lg:text-base">Widzimy się</span>
        <span className="font-display text-4xl font-extrabold tracking-tightest lg:text-6xl">
          {weekday}
          <span className="hidden lg:inline">,</span>
          <br className="lg:hidden" /> {day}
        </span>
        <span className="font-display text-3xl font-bold text-heat-3 lg:text-4xl">{hours}</span>
      </p>
      <div className="grid gap-2 lg:flex lg:gap-3">
        {organiser && sendAction}
        {calendarAction}
        {!organiser && sendAction}
      </div>
      {notice && (
        <p className="m-0 text-sm text-on-dark-muted" role="status">
          {notices[notice]}
        </p>
      )}
    </section>
  );
}
