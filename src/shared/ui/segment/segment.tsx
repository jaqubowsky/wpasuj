import styles from "./segment.module.css";

type SegmentProps<Option extends string> = {
  label: string;
  options: readonly Option[];
  selected: Option;
  onSelect: (option: Option) => void;
};

export function Segment<Option extends string>({ label, options, selected, onSelect }: SegmentProps<Option>) {
  return (
    <div className={styles.segment} role="tablist" aria-label={label}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          role="tab"
          aria-selected={option === selected}
          onClick={() => onSelect(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
