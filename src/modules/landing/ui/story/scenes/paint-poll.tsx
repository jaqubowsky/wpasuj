import { Card } from "@/shared/ui/card/card";
import type { CSSProperties } from "react";
import { paintDays, paintHours, paintPollAt } from "../../../domain/paint-poll";
import type { SceneProps } from "../story-steps";
import { PollGrid, PollHead, Tabs } from "./poll-parts";

export function PaintPoll({ time }: SceneProps) {
  const poll = paintPollAt(time);
  const isPainted = (column: number, row: number) => poll.painted.some((cell) => cell.column === column && cell.row === row);

  return (
    <>
      <PollHead line="Kuba pyta" />
      <div className="mb-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Twoje imię</span>
          <span
            data-saved={poll.painted.length > 0 || undefined}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted opacity-0 transition-opacity duration-(--duration-pop) ease-out data-saved:opacity-100"
          >
            <svg className="size-4 flex-none" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Zapisane
          </span>
        </div>
        <span className="box-border flex h-12 items-center rounded-control bg-surface px-4 text-base font-medium shadow-[inset_0_0_0_1px_var(--color-edge)]">
          Zuza
        </span>
      </div>
      <Tabs selected="Moje" />
      <Card>
        <span className="mb-3 grid h-11 place-items-center rounded-control text-base font-semibold shadow-[inset_0_0_0_1px_var(--color-edge)]">
          Nie mogę w żadnym terminie
        </span>
        <PollGrid
          days={paintDays}
          hours={paintHours}
          cell={(row, column) => (
            <span className="relative rounded-cell bg-surface shadow-[inset_0_0_0_1px_var(--color-edge)]">
              <span
                aria-hidden
                data-painted={isPainted(column, row) || undefined}
                className="absolute inset-0 rounded-cell bg-accent opacity-0 transition-opacity duration-(--duration-fill) ease-out data-painted:opacity-100"
              />
            </span>
          )}
        >
          <span
            aria-hidden
            data-touching={poll.finger ? true : undefined}
            className="absolute inset-0 col-start-2 col-end-3 row-start-2 row-end-3 grid place-items-center opacity-0 translate-x-[calc(var(--finger-column)*(100%+--spacing(1.5)))] translate-y-[calc(var(--finger-row)*(100%+--spacing(1.5)))] transition-[opacity,translate] duration-(--duration-sheet) ease-out data-touching:opacity-100"
            style={poll.finger && ({ "--finger-column": poll.finger.column, "--finger-row": poll.finger.row } as CSSProperties)}
          >
            <span className="size-8.5 rounded-pill bg-ink/18 ring-6 ring-ink/6" />
          </span>
        </PollGrid>
      </Card>
    </>
  );
}
