import { Chip } from "@/shared/ui/chip/chip";
import { Stepper } from "@/shared/ui/stepper/stepper";
import styles from "./create-poll-form.module.css";
import type { HourRangeState, RangeChoice } from "./use-hour-range";

const choices: { choice: RangeChoice; label: string }[] = [
  { choice: "evening", label: "Wieczór 17–23" },
  { choice: "all-day", label: "Cały dzień" },
  { choice: "custom", label: "Własne" },
];

export function HourRangePicker({ hours }: { hours: HourRangeState }) {
  return (
    <>
      <div className={styles.chips}>
        {choices.map(({ choice, label }) => (
          <Chip key={choice} pressed={hours.choice === choice} onClick={() => hours.choose(choice)}>
            {label}
          </Chip>
        ))}
      </div>
      {hours.choice === "custom" && (
        <div className={styles.steppers}>
          <Stepper label="od" value={hours.custom.firstHour} {...hours.startBounds} onChange={hours.setStart} />
          <Stepper label="do" value={hours.custom.lastHour} {...hours.endBounds} onChange={hours.setEnd} />
        </div>
      )}
    </>
  );
}
