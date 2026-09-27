import type { ElementType, ReactNode } from "react";
import styles from "./text.module.css";

type Variant = "wordmark" | "title" | "best-time" | "day-number" | "heading" | "body" | "chip" | "button" | "meta";

type TextProps = {
  variant: Variant;
  as?: ElementType;
  children: ReactNode;
};

export function Text({ variant, as: Element = "span", children }: TextProps) {
  return (
    <Element className={styles.text} data-variant={variant}>
      {children}
    </Element>
  );
}
