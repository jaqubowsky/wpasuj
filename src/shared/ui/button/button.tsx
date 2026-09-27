import type { ComponentProps } from "react";
import styles from "./button.module.css";

type ButtonProps = Omit<ComponentProps<"button">, "className"> & {
  variant?: "primary" | "on-dark" | "text";
  size?: "small";
  block?: boolean;
};

export function Button({ variant, size, block, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={styles.button}
      data-variant={variant}
      data-size={size}
      data-block={block || undefined}
      {...props}
    />
  );
}
