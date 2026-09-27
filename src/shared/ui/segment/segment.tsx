import { useId, type KeyboardEvent, type ReactNode } from "react";
import styles from "./segment.module.css";

type SegmentProps<Option extends string> = {
  label: string;
  options: readonly Option[];
  selected: Option;
  onSelect: (option: Option) => void;
  panels: Record<Option, ReactNode>;
};

const steps: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };

export function Segment<Option extends string>({ label, options, selected, onSelect, panels }: SegmentProps<Option>) {
  const id = useId();
  const tabId = (option: Option) => `${id}-tab-${options.indexOf(option)}`;
  const panelId = `${id}-panel`;

  function moveWithArrows(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const step = steps[event.key];
    if (!step) return;
    const next = options[(index + step + options.length) % options.length];
    document.getElementById(tabId(next))?.focus();
    onSelect(next);
  }

  return (
    <>
      <div className={styles.segment} role="tablist" aria-label={label}>
        {options.map((option, index) => (
          <button
            key={option}
            id={tabId(option)}
            type="button"
            role="tab"
            aria-selected={option === selected}
            aria-controls={option === selected ? panelId : undefined}
            tabIndex={option === selected ? 0 : -1}
            onClick={() => onSelect(option)}
            onKeyDown={(event) => moveWithArrows(event, index)}
          >
            {option}
          </button>
        ))}
      </div>
      <div id={panelId} role="tabpanel" aria-labelledby={tabId(selected)}>
        {panels[selected]}
      </div>
    </>
  );
}
