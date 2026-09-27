import type { ComponentProps } from "react";

type CellButtonProps = Omit<ComponentProps<"button">, "type" | "aria-pressed" | "className">;

type AnswerCellProps = Omit<CellButtonProps, "children"> & {
  state?: "mine" | "adding" | "removing";
};

type HeatCellProps = CellButtonProps & {
  heat: 0 | 1 | 2 | 3 | 4 | 5;
  everyone?: boolean;
  best?: boolean;
};

export function Cell(props: AnswerCellProps | HeatCellProps) {
  if ("heat" in props) {
    const { heat, everyone, best, ...buttonProps } = props;
    return (
      <button
        type="button"
        className="box-border inline-grid h-cell w-[56px] cursor-pointer place-items-center rounded-cell border-0 bg-surface p-[0] font-sans text-label leading-none font-semibold text-ink tabular-nums shadow-[inset_0_0_0_1px_var(--color-edge)] transition-[background,scale] duration-(--duration-fill) ease-out focus-visible:shadow-[inset_0_0_0_2px_var(--color-ink)] focus-visible:outline-none motion-safe:active:scale-96 data-best:outline-2 data-best:outline-offset-2 data-best:outline-ink data-everyone:shadow-[inset_0_0_0_2px_var(--color-ink)] data-heat:not-data-everyone:not-focus-visible:shadow-none data-state:not-focus-visible:shadow-none data-[heat=1]:bg-heat-1 data-[heat=2]:bg-heat-2 data-[heat=3]:bg-heat-3 data-[heat=4]:bg-heat-4 data-[heat=5]:bg-heat-5 data-[heat=5]:text-surface data-[state=adding]:bg-accent/35 data-[state=adding]:transition-transform data-[state=mine]:bg-accent data-[state=removing]:bg-line data-[state=removing]:transition-transform"
        data-heat={heat || undefined}
        data-everyone={everyone || undefined}
        data-best={best || undefined}
        {...buttonProps}
      />
    );
  }

  const { state, ...buttonProps } = props;
  return <button type="button" className="box-border inline-grid h-cell w-[56px] cursor-pointer place-items-center rounded-cell border-0 bg-surface p-[0] font-sans text-label leading-none font-semibold text-ink tabular-nums shadow-[inset_0_0_0_1px_var(--color-edge)] transition-[background,scale] duration-(--duration-fill) ease-out focus-visible:shadow-[inset_0_0_0_2px_var(--color-ink)] focus-visible:outline-none motion-safe:active:scale-96 data-best:outline-2 data-best:outline-offset-2 data-best:outline-ink data-everyone:shadow-[inset_0_0_0_2px_var(--color-ink)] data-heat:not-data-everyone:not-focus-visible:shadow-none data-state:not-focus-visible:shadow-none data-[heat=1]:bg-heat-1 data-[heat=2]:bg-heat-2 data-[heat=3]:bg-heat-3 data-[heat=4]:bg-heat-4 data-[heat=5]:bg-heat-5 data-[heat=5]:text-surface data-[state=adding]:bg-accent/35 data-[state=adding]:transition-transform data-[state=mine]:bg-accent data-[state=removing]:bg-line data-[state=removing]:transition-transform" data-state={state} {...buttonProps} />;
}
