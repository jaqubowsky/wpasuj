import type { ComponentProps } from "react";
import styles from "./chip.module.css";

type ChipProps = Omit<ComponentProps<"button">, "type" | "aria-pressed" | "className"> & {
  pressed: boolean;
};

export function Chip({ pressed, ...props }: ChipProps) {
  return <button type="button" className={styles.chip} aria-pressed={pressed} {...props} />;
}
