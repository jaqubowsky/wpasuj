import { useId } from "react";
import styles from "./stepper.module.css";

type StepperProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
};

export function Stepper({ label, value, min, max, onChange }: StepperProps) {
  const labelId = useId();

  return (
    <div className={styles.field} role="group" aria-labelledby={labelId}>
      <span id={labelId}>{label}</span>
      <span className={styles.stepper}>
        <button type="button" aria-label="Wcześniej" disabled={value <= min} onClick={() => onChange(value - 1)}>
          −
        </button>
        <output>{value}</output>
        <button type="button" aria-label="Później" disabled={value >= max} onClick={() => onChange(value + 1)}>
          +
        </button>
      </span>
    </div>
  );
}
