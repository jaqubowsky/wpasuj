"use client";

import { useForgetTappedHour } from "@/modules/view-results/client";
import { withViewTransition } from "@/shared/view-transition";
import { Segment } from "@/shared/ui/segment/segment";
import { useState, type ReactNode } from "react";

const views = ["Moje", "Wszyscy"] as const;

type View = (typeof views)[number];

type PollTabsProps = {
  opening: View;
  leads: Partial<Record<View, ReactNode>>;
  bodies: Record<View, ReactNode>;
};

export function PollTabs({ opening, leads, bodies }: PollTabsProps) {
  const [view, setView] = useState<View>(opening);
  const forgetTappedHour = useForgetTappedHour();

  function show(next: View) {
    if (next === "Moje") forgetTappedHour();
    setView(next);
  }

  return (
    <div className="flex flex-col gap-4 lg:[&>[role=tablist]]:-order-1">
      {leads[view]}
      <Segment label="Widok" options={views} selected={view} onSelect={(next) => withViewTransition(() => show(next))} panels={bodies} />
    </div>
  );
}
