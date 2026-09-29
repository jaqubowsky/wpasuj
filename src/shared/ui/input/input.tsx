import { Morph } from "@/shared/morph";
import { useId, type ComponentProps, type ReactNode } from "react";
import { useTypingBeforeHydration } from "./use-typing-before-hydration";

type InputProps = Omit<ComponentProps<"input">, "aria-invalid" | "aria-describedby" | "className" | "id"> & {
  label: string;
  labelAside?: ReactNode;
  variant?: "compact";
  error?: string;
  morph?: string;
};

export function Input({ label, labelAside, variant, error, morph, ref, ...props }: InputProps) {
  const inputId = useId();
  const errorId = useId();
  const input = useTypingBeforeHydration(ref);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor={inputId}
          className="font-display text-lg font-bold normal-nums not-data-[variant=compact]:tracking-tight data-[variant=compact]:font-sans data-[variant=compact]:text-sm data-[variant=compact]:font-semibold"
          data-variant={variant}
        >
          {label}
        </label>
        {labelAside}
      </div>
      <Morph name={morph}>
        <input
          ref={input}
          id={inputId}
          className="box-border h-14 w-full rounded-control border-0 bg-surface px-4 py-0 font-sans text-base font-medium text-ink shadow-[inset_0_0_0_1px_var(--color-edge)] placeholder:text-muted focus:shadow-[inset_0_0_0_2px_var(--color-ink)] focus:outline-none aria-invalid:not-focus:shadow-[inset_0_0_0_2px_var(--color-accent-ink)] data-[variant=compact]:h-13"
          data-variant={variant}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...props}
        />
      </Morph>
      {error && (
        <small id={errorId} className="text-sm font-medium text-accent-ink">
          {error}
        </small>
      )}
    </div>
  );
}
