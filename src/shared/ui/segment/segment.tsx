import { useId, type KeyboardEvent, type ReactNode } from "react";

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
  const panelId = (option: Option) => `${id}-panel-${options.indexOf(option)}`;

  function moveWithArrows(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const step = steps[event.key];

    if (!step) return;

    const next = options[(index + step + options.length) % options.length];

    document.getElementById(tabId(next))?.focus();
    onSelect(next);
  }

  return (
    <>
      <div className="flex rounded-control bg-track p-1" role="tablist" aria-label={label}>
        {options.map((option, index) => (
          <button
            key={option}
            id={tabId(option)}
            type="button"
            className="h-11 flex-1 cursor-pointer rounded-cell border-0 bg-transparent font-sans text-base leading-none font-semibold text-muted focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink aria-selected:bg-surface aria-selected:text-ink aria-selected:shadow-lift"
            role="tab"
            aria-selected={option === selected}
            aria-controls={panelId(option)}
            tabIndex={option === selected ? 0 : -1}
            onClick={() => onSelect(option)}
            onKeyDown={(event) => moveWithArrows(event, index)}
          >
            {option}
          </button>
        ))}
      </div>
      {options.map((option) => (
        <div key={option} id={panelId(option)} role="tabpanel" aria-labelledby={tabId(option)} hidden={option !== selected}>
          {panels[option]}
        </div>
      ))}
    </>
  );
}
