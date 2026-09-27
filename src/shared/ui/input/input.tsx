import { Morph } from "@/shared/morph";
import { useId, type ComponentProps } from "react";

type InputProps = Omit<ComponentProps<"input">, "aria-invalid" | "aria-describedby" | "className" | "id"> & {
  label: string;
  variant?: "title";
  error?: string;
  morph?: string;
};

export function Input({ label, variant, error, morph, ...props }: InputProps) {
  const inputId = useId();
  const errorId = useId();

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="font-display text-section font-bold tracking-[-0.01em] normal-nums">{label}</label>
      <Morph name={morph}>
        <input
          id={inputId}
          className="box-border h-[56px] w-full rounded-control border-0 bg-surface px-4 py-[0] font-sans text-body font-medium text-ink shadow-[inset_0_0_0_1px_var(--color-edge)] placeholder:text-muted focus:outline-none focus:shadow-[inset_0_0_0_2px_var(--color-ink)] aria-invalid:not-focus:shadow-[inset_0_0_0_2px_var(--color-accent-ink)] data-[variant=title]:h-auto data-[variant=title]:rounded-none data-[variant=title]:bg-transparent data-[variant=title]:px-[0] data-[variant=title]:py-3 data-[variant=title]:font-display data-[variant=title]:text-title data-[variant=title]:font-bold data-[variant=title]:tracking-[-0.025em] data-[variant=title]:shadow-[inset_0_-2px_0_var(--color-ink)] data-[variant=title]:aria-invalid:not-focus:shadow-[inset_0_-2px_0_var(--color-accent-ink)] data-[variant=title]:focus:shadow-[inset_0_-3px_0_var(--color-ink)] lg:data-[variant=title]:text-title-desktop"
          data-variant={variant}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...props}
        />
      </Morph>
      {error && <small id={errorId} className="text-label font-medium text-accent-ink">{error}</small>}
    </div>
  );
}
