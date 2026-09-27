import { useId, type ComponentProps } from "react";
import styles from "./input.module.css";

type InputProps = Omit<ComponentProps<"input">, "aria-invalid" | "aria-describedby" | "className" | "id"> & {
  label: string;
  variant?: "title";
  error?: string;
};

export function Input({ label, variant, error, ...props }: InputProps) {
  const inputId = useId();
  const errorId = useId();

  return (
    <div className={styles.field}>
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        className={styles.input}
        data-variant={variant}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && <small id={errorId}>{error}</small>}
    </div>
  );
}
