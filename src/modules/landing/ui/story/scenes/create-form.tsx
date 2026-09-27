import { createFormAt } from "../../../domain/create-form";
import type { SceneProps } from "../story-steps";

function Chip({ label, on }: { label: string; on?: boolean }) {
  return (
    <span className="relative flex h-[36px] items-center rounded-pill bg-surface px-[13px] text-caption font-medium shadow-[inset_0_0_0_1px_var(--color-edge)]">
      {label}
      <span
        aria-hidden
        data-on={on || undefined}
        className="absolute inset-[0] flex items-center rounded-pill bg-ink px-[13px] text-surface opacity-0 transition-opacity duration-(--duration-sheet) ease-out data-on:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}

export function CreateForm({ time }: SceneProps) {
  const form = createFormAt(time);

  return (
    <div className="flex grow flex-col gap-2">
      <span className="text-caption font-semibold">Co robimy?</span>
      <p className="m-[0] border-b-2 border-ink pt-2 pb-[10px] font-display text-day font-bold tracking-[-0.03em]">
        {form.title}
        <span aria-hidden className="ml-[2px] inline-block h-[22px] w-[2px] bg-accent align-[-3px]" />
      </p>
      <span className="mt-2 text-caption font-semibold">Kiedy?</span>
      <div className="flex flex-wrap gap-2">
        <Chip label="Dziś" />
        <Chip label="Jutro" />
        <Chip label="Ten weekend" on={form.weekend} />
        <Chip label="Przyszły tydzień" />
      </div>
      <span className="mt-2 text-caption font-semibold">O której?</span>
      <div className="flex flex-wrap gap-2">
        <Chip label="Wieczór 17–23" on={form.evening} />
        <Chip label="Cały dzień" />
        <Chip label="Własne" />
      </div>
      <span
        data-pressed={form.pressed || undefined}
        className="mt-auto grid h-button place-items-center rounded-control bg-ink text-bubble font-semibold text-surface transition-transform duration-(--duration-sheet) ease-out motion-safe:data-pressed:scale-96"
      >
        Utwórz i wyślij na grupę
      </span>
    </div>
  );
}
