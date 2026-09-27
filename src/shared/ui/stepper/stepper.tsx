import { useId } from "react";

type StepperProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
};

export function Stepper({ label, value, min, max, onChange }: StepperProps) {
  const labelId = useId();

  return (
    <div className="flex flex-col gap-2" role="group" aria-labelledby={labelId}>
      <span id={labelId} className="font-sans text-label font-medium normal-nums">{label}</span>
      <span className="inline-flex items-center gap-1 rounded-control bg-surface p-1 shadow-[inset_0_0_0_1px_var(--color-edge)]">
        <button type="button" className="size-target cursor-pointer rounded-cell border-0 bg-track font-sans text-stepper font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-default disabled:text-muted" aria-label="Wcześniej" disabled={value <= min} onClick={() => onChange(value - 1)}>
          −
        </button>
        <output className="min-w-[64px] text-center font-display text-day font-bold tracking-[-0.02em] normal-nums">{value}</output>
        <button type="button" className="size-target cursor-pointer rounded-cell border-0 bg-track font-sans text-stepper font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-default disabled:text-muted" aria-label="Później" disabled={value >= max} onClick={() => onChange(value + 1)}>
          +
        </button>
      </span>
    </div>
  );
}
