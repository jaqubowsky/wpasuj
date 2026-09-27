import type { ComponentProps, ReactNode } from "react";
import styles from "./cell.module.css";

type AnswerCellProps = Omit<ComponentProps<"button">, "type" | "aria-pressed" | "children" | "className"> & {
  pressed: boolean;
  state?: "mine" | "adding" | "removing";
};

type HeatCellProps = {
  heat: 1 | 2 | 3 | 4 | 5;
  everyone?: boolean;
  best?: boolean;
  children: ReactNode;
};

export function Cell(props: AnswerCellProps | HeatCellProps) {
  if ("heat" in props) {
    const { heat, everyone, best, children } = props;
    return (
      <span className={styles.cell} data-heat={heat} data-everyone={everyone || undefined} data-best={best || undefined}>
        {children}
      </span>
    );
  }

  const { pressed, state, ...buttonProps } = props;
  return <button type="button" className={styles.cell} aria-pressed={pressed} data-state={state} {...buttonProps} />;
}
