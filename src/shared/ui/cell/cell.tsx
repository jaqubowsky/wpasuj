import type { ComponentProps } from "react";
import styles from "./cell.module.css";

type CellButtonProps = Omit<ComponentProps<"button">, "type" | "aria-pressed" | "className">;

type AnswerCellProps = Omit<CellButtonProps, "children"> & {
  pressed: boolean;
  state?: "mine" | "adding" | "removing";
};

type HeatCellProps = CellButtonProps & {
  heat: 0 | 1 | 2 | 3 | 4 | 5;
  everyone?: boolean;
  best?: boolean;
  bump?: boolean;
};

export function Cell(props: AnswerCellProps | HeatCellProps) {
  if ("heat" in props) {
    const { heat, everyone, best, bump, ...buttonProps } = props;
    return (
      <button
        type="button"
        className={styles.cell}
        data-heat={heat || undefined}
        data-everyone={everyone || undefined}
        data-best={best || undefined}
        data-bump={bump || undefined}
        {...buttonProps}
      />
    );
  }

  const { pressed, state, ...buttonProps } = props;
  return <button type="button" className={styles.cell} aria-pressed={pressed} data-state={state} {...buttonProps} />;
}
