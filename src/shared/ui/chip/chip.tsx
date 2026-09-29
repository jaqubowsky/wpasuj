import type { ComponentProps } from "react";

type ChipProps = Omit<ComponentProps<"button">, "type" | "aria-pressed" | "className"> & {
  pressed: boolean;
};

export function Chip({ pressed, ...props }: ChipProps) {
  return (
    <button
      type="button"
      className="box-border h-11 cursor-pointer rounded-pill border-0 bg-surface px-4 py-0 font-sans text-base font-medium whitespace-nowrap text-ink shadow-ledge-sm inset-ring shadow-edge inset-ring-edge transition-[translate,box-shadow] duration-(--duration-fill) ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink aria-pressed:bg-ink aria-pressed:text-surface aria-pressed:inset-ring-0 aria-pressed:shadow-heat-5 motion-safe:active:translate-y-1 motion-safe:active:shadow-ledge-sm-down"
      aria-pressed={pressed}
      {...props}
    />
  );
}
