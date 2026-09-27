import type { ReactNode } from "react";
import styles from "./card.module.css";

type CardProps = {
  tone?: "ink";
  size?: "compact";
  label?: string;
  children: ReactNode;
};

export function Card({ tone, size, label, children }: CardProps) {
  return (
    <div className={styles.card} data-tone={tone} data-size={size}>
      {label && <span className={styles.label}>{label}</span>}
      {children}
    </div>
  );
}
