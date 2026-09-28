import { createFormAt } from "../../../domain/create-form";
import type { SceneProps } from "../story-steps";

const week = [
  { weekday: "pn", day: 13 },
  { weekday: "wt", day: 14 },
  { weekday: "śr", day: 15 },
  { weekday: "cz", day: 16 },
  { weekday: "pt", day: 17, weekend: true },
  { weekday: "sb", day: 18, weekend: true },
  { weekday: "nd", day: 19, weekend: true },
];

function Chip({ label, on }: { label: string; on?: boolean }) {
  return (
    <span className="relative flex h-10 items-center rounded-pill bg-surface px-3.5 text-sm font-medium shadow-[inset_0_0_0_1px_var(--color-edge)]">
      {label}
      <span
        aria-hidden
        data-on={on || undefined}
        className="absolute inset-0 flex items-center rounded-pill bg-ink px-3.5 text-surface opacity-0 transition-opacity duration-(--duration-sheet) ease-out data-on:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}

function HourField({ label, children }: { label: string; children: string }) {
  return (
    <span className="flex flex-col gap-1 text-sm text-muted">
      {label}
      <span className="box-border flex h-11 items-center rounded-control bg-surface px-3.5 text-base font-semibold text-ink shadow-[inset_0_0_0_1px_var(--color-edge)]">
        {children}
      </span>
    </span>
  );
}

export function CreateForm({ time }: SceneProps) {
  const form = createFormAt(time);

  return (
    <div className="flex grow flex-col">
      <span className="font-display text-lg font-bold tracking-tight">Co robimy?</span>
      <p className="m-0 py-2.5 font-display text-2xl font-bold tracking-tightest shadow-[inset_0_-2px_0_var(--color-ink)]">
        {form.title}
        <span aria-hidden className="ml-0.5 inline-block h-6 w-0.5 bg-accent align-text-bottom" />
      </p>
      <span className="mt-4 mb-2 font-display text-lg font-bold tracking-tight">Kiedy?</span>
      <div className="flex flex-wrap gap-2">
        <Chip label="Dziś" />
        <Chip label="Jutro" />
        <Chip label="Ten weekend" on={form.weekend} />
        <Chip label="Przyszły tydzień" />
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center">
        {week.map(({ weekday }) => (
          <span key={weekday} className="text-xs font-medium text-muted">
            {weekday}
          </span>
        ))}
        {week.map(({ day, weekend }) => (
          <span key={day} className="relative grid h-9 place-items-center rounded-cell bg-surface text-sm font-medium shadow-[inset_0_0_0_1px_var(--color-edge)]">
            {day}
            <span
              aria-hidden
              data-on={(weekend && form.weekend) || undefined}
              className="absolute inset-0 grid place-items-center rounded-cell bg-accent font-semibold opacity-0 transition-opacity duration-(--duration-sheet) ease-out data-on:opacity-100"
            >
              {day}
            </span>
          </span>
        ))}
      </div>
      <span className="mt-4 mb-2 font-display text-lg font-bold tracking-tight">O której?</span>
      <div className="grid grid-cols-[minmax(0,1fr)_--spacing(5)_minmax(0,1fr)] items-end gap-2">
        <HourField label="Od">17:00</HourField>
        <span className="grid h-11 place-items-center text-muted">→</span>
        <HourField label="Do">23:00</HourField>
      </div>
      <p
        data-on={form.evening || undefined}
        className="m-0 mt-2 grid h-10 place-items-center rounded-control bg-track font-display text-base font-bold opacity-0 transition-opacity duration-(--duration-sheet) ease-out data-on:opacity-100"
      >
        17:00 → 23:00 · 6 godzin
      </p>
      <span className="mt-4 mb-2 font-display text-lg font-bold tracking-tight">Twoje imię</span>
      <span className="box-border flex h-12 items-center rounded-control bg-surface px-4 text-base font-medium shadow-[inset_0_0_0_1px_var(--color-edge)]">
        Kuba
      </span>
      <span
        data-pressed={form.pressed || undefined}
        className="mt-auto grid h-13 place-items-center rounded-control bg-ink text-base font-semibold text-surface transition-transform duration-(--duration-sheet) ease-out motion-safe:data-pressed:scale-96"
      >
        Utwórz i wyślij na grupę
      </span>
    </div>
  );
}
