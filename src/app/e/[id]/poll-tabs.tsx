"use client";

import { withViewTransition } from "@/shared/view-transition";
import { Segment } from "@/shared/ui/segment/segment";
import { useState, type ReactNode } from "react";

const views = ["Moje", "Wszyscy"] as const;

type View = (typeof views)[number];

type PollTabsProps = {
  opening: View;
  leads: Record<View, ReactNode>;
  bodies: Record<View, ReactNode>;
};

export function PollTabs({ opening, leads, bodies }: PollTabsProps) {
  const [view, setView] = useState<View>(opening);

  return (
    <>
      {leads[view] && <div data-poll-lead className="mb-4">{leads[view]}</div>}
      <Segment label="Widok" options={views} selected={view} onSelect={(next) => withViewTransition(() => setView(next))} panels={bodies} />
    </>
  );
}
