"use client";

import { Sheet } from "@/shared/ui/sheet/sheet";
import { useMediaQuery } from "@/shared/use-media-query";
import { useState } from "react";
import { CellPanel } from "./cell-details";
import { Heatmap } from "./heatmap";
import { useResultsContext } from "./results-provider";
import { useSelectedCell } from "./use-selected-cell";

const label = "Wszystkie głosy";
const thumbnail = ["heat-1", "heat-3", "heat-1", "heat-3", "heat-4", "heat-2", "heat-3", "heat-4", "heat-2"] as const;

function Votes() {
  const { results, organiserKey } = useResultsContext();
  const selection = useSelectedCell();

  return (
    <div className="grid gap-4">
      <Heatmap results={results} isSelected={selection.isSelected} onCellTap={selection.toggle} />
      {selection.selected && (
        <CellPanel cell={selection.selected} results={results} organiserKey={organiserKey} onClose={selection.close} />
      )}
    </div>
  );
}

export function AllVotes() {
  const [open, setOpen] = useState(false);
  const desktop = useMediaQuery("(min-width: 1024px)");

  return (
    <div className="grid gap-4">
      <button
        type="button"
        className="box-border flex min-h-16 w-full cursor-pointer items-center gap-3.5 rounded-card border-0 bg-surface px-4 py-3 text-left font-sans text-base font-semibold text-ink shadow-[inset_0_0_0_1px_var(--color-edge)] transition-transform duration-(--duration-fill) ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink motion-safe:active:scale-97"
        aria-haspopup={desktop ? undefined : "dialog"}
        aria-expanded={desktop ? open : undefined}
        onClick={() => setOpen((shown) => !shown)}
      >
        <span className="grid grid-cols-[repeat(3,--spacing(2.5))] gap-0.5" aria-hidden="true">
          {thumbnail.map((heat, index) => (
            <span
              key={index}
              className="size-2.5 rounded-[2px] data-[heat=heat-1]:bg-heat-1 data-[heat=heat-2]:bg-heat-2 data-[heat=heat-3]:bg-heat-3 data-[heat=heat-4]:bg-heat-4"
              data-heat={heat}
            />
          ))}
        </span>
        <span className="grow">Zobacz wszystkie głosy</span>
        <svg
          className="size-4.5 flex-none data-open:rotate-90 motion-safe:transition-transform"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          data-open={(desktop && open) || undefined}
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
      {open &&
        (desktop ? (
          <section aria-label={label} className="rounded-card bg-surface p-6">
            <Votes />
          </section>
        ) : (
          <Sheet label={label} onClose={() => setOpen(false)}>
            <h2 className="m-0 mb-2 font-display text-2xl font-bold tracking-tighter">{label}</h2>
            <Votes />
          </Sheet>
        ))}
    </div>
  );
}
