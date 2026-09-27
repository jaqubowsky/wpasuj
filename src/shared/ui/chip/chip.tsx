import type { ComponentProps } from "react";

type ChipProps = Omit<ComponentProps<"button">, "type" | "aria-pressed" | "className"> & {
  pressed: boolean;
};

export function Chip({ pressed, ...props }: ChipProps) {
  return (
    <button
      type="button"
      className="box-border h-target cursor-pointer rounded-pill border-0 bg-surface px-4 py-[0] font-sans text-body font-medium whitespace-nowrap text-ink shadow-[inset_0_0_0_1px_var(--color-edge)] transition-transform duration-(--duration-fill) ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink motion-safe:active:scale-95 aria-pressed:bg-ink aria-pressed:text-surface aria-pressed:shadow-none"
      aria-pressed={pressed}
      {...props}
    />
  );
}
