import { productName } from "@/shared/brand";
import { Avatar } from "@/shared/ui/avatar/avatar";
import { Text } from "@/shared/ui/text/text";
import { Fragment, type ReactNode } from "react";

export function PollHead({ line, aside }: { line: string; aside?: ReactNode }) {
  return (
    <div className="mb-3 flex flex-col gap-1.5">
      <div className="mb-1 flex h-9 items-center justify-between gap-2">
        <Text variant="wordmark">{productName}</Text>
        {aside}
      </div>
      <span className="flex items-center gap-2 text-sm text-muted">
        <Avatar name="Kuba" tintKey="kuba" />
        <span>{line}</span>
      </span>
      <p className="m-0 font-display text-2xl font-bold tracking-tighter">Planszówki u Michała</p>
    </div>
  );
}

const tabs = ["Moje", "Wszyscy"] as const;

export function Tabs({ selected }: { selected: (typeof tabs)[number] }) {
  return (
    <div className="mb-3 flex rounded-control bg-track p-1">
      {tabs.map((tab) => (
        <span
          key={tab}
          data-selected={tab === selected || undefined}
          className="grid h-10 flex-1 place-items-center rounded-cell text-base font-semibold text-muted data-selected:bg-surface data-selected:text-ink data-selected:shadow-lift"
        >
          {tab}
        </span>
      ))}
    </div>
  );
}

type PollGridProps = {
  days: string[];
  hours: number[];
  cell: (row: number, column: number) => ReactNode;
  children?: ReactNode;
};

export function PollGrid({ days, hours, cell, children }: PollGridProps) {
  return (
    <div className="relative grid grid-cols-[--spacing(11)_repeat(3,minmax(0,1fr))] grid-rows-[auto] auto-rows-12 gap-1.5">
      <span />
      {days.map((day) => (
        <span key={day} className="grid h-9 place-items-center text-sm font-semibold">
          {day}
        </span>
      ))}
      {hours.map((hour, row) => [
        <span key={hour} className="grid items-center text-sm font-medium text-muted">
          {hour}:00
        </span>,
        ...days.map((day, column) => <Fragment key={`${day}-${hour}`}>{cell(row, column)}</Fragment>),
      ])}
      {children}
    </div>
  );
}

const stackSize = 3;

export function PeoplePill({ names, count }: { names: string[]; count: string }) {
  return (
    <span className="inline-flex h-9 items-center gap-2 rounded-pill bg-surface px-2.5 text-sm font-semibold shadow-[inset_0_0_0_1px_var(--color-edge)]">
      <span className="inline-flex" aria-hidden>
        {names.slice(-stackSize).toReversed().map((name) => (
          <Avatar key={name} name={name} tintKey={name.toLocaleLowerCase("pl")} size="dot" pop />
        ))}
      </span>
      {count}
    </span>
  );
}

type HeatCellProps = { count: number; heat: number };

export function HeatCell({ count, heat }: HeatCellProps) {
  return (
    <span
      data-heat={heat || undefined}
      className="grid place-items-center rounded-cell bg-surface text-sm font-semibold shadow-[inset_0_0_0_1px_var(--color-edge)] data-heat:shadow-none data-[heat=1]:bg-heat-1 data-[heat=2]:bg-heat-2 data-[heat=3]:bg-heat-3 data-[heat=4]:bg-heat-4 data-[heat=5]:bg-heat-5 data-[heat=5]:text-surface"
    >
      {count || ""}
    </span>
  );
}
