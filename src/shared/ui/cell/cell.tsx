import type { ComponentProps } from "react";

type CellButtonProps = Omit<ComponentProps<"button">, "type" | "aria-pressed" | "className">;

type AnswerCellProps = Omit<CellButtonProps, "children"> & {
  state?: "mine" | "adding" | "removing";
};

type HeatCellProps = CellButtonProps & {
  heat: 0 | 1 | 2 | 3 | 4 | 5;
  selected?: boolean;
};

export function Cell(props: AnswerCellProps | HeatCellProps) {
  if ("heat" in props) {
    const { heat, selected, ...buttonProps } = props;

    return (
      <button
        type="button"
        className="box-border inline-grid h-12 w-14 cursor-pointer place-items-center rounded-cell border-0 bg-surface p-0 font-sans text-base leading-none font-extrabold text-ink tabular-nums inset-ring inset-ring-edge transition-[background,scale] duration-(--duration-fill) ease-out focus-visible:inset-ring-2 focus-visible:inset-ring-ink focus-visible:outline-none data-heat:not-focus-visible:not-data-selected:inset-ring-0 data-selected:animate-pop data-selected:inset-ring-3 data-selected:inset-ring-ink data-[heat=1]:bg-heat-1 data-[heat=2]:bg-heat-2 data-[heat=3]:bg-heat-3 data-[heat=4]:bg-heat-4 data-[heat=5]:bg-heat-5 data-[heat=5]:text-surface data-[state=adding]:bg-heat-3 data-[state=adding]:inset-ring-2 data-[state=adding]:inset-ring-heat-5 data-[state=adding]:transition-transform data-[state=mine]:bg-accent data-[state=mine]:shadow-ledge-xs data-[state=mine]:shadow-heat-5 data-[state=mine]:not-focus-visible:inset-ring-0 data-[state=removing]:opacity-50 data-[state=removing]:inset-ring-2 data-[state=removing]:inset-ring-ink data-[state=removing]:transition-transform motion-safe:active:scale-96 motion-safe:data-[state=adding]:scale-96 motion-safe:data-[state=removing]:scale-96"
        data-heat={heat || undefined}
        data-selected={selected || undefined}
        {...buttonProps}
      />
    );
  }

  const { state, ...buttonProps } = props;

  return (
    <button
      type="button"
      className="box-border inline-grid h-12 w-14 cursor-pointer place-items-center rounded-cell border-0 bg-surface p-0 font-sans text-base leading-none font-extrabold text-ink tabular-nums inset-ring inset-ring-edge transition-[background,scale] duration-(--duration-fill) ease-out focus-visible:inset-ring-2 focus-visible:inset-ring-ink focus-visible:outline-none data-heat:not-focus-visible:not-data-selected:inset-ring-0 data-selected:animate-pop data-selected:inset-ring-3 data-selected:inset-ring-ink data-[heat=1]:bg-heat-1 data-[heat=2]:bg-heat-2 data-[heat=3]:bg-heat-3 data-[heat=4]:bg-heat-4 data-[heat=5]:bg-heat-5 data-[heat=5]:text-surface data-[state=adding]:bg-heat-3 data-[state=adding]:inset-ring-2 data-[state=adding]:inset-ring-heat-5 data-[state=adding]:transition-transform data-[state=mine]:bg-accent data-[state=mine]:shadow-ledge-xs data-[state=mine]:shadow-heat-5 data-[state=mine]:not-focus-visible:inset-ring-0 data-[state=removing]:opacity-50 data-[state=removing]:inset-ring-2 data-[state=removing]:inset-ring-ink data-[state=removing]:transition-transform motion-safe:active:scale-96 motion-safe:data-[state=adding]:scale-96 motion-safe:data-[state=removing]:scale-96"
      data-state={state}
      {...buttonProps}
    />
  );
}
