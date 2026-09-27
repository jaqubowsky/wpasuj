"use client";

import { Segment } from "@/shared/ui/segment/segment";
import { useState, type ReactNode } from "react";

const views = ["Moje", "Wszyscy"] as const;

type View = (typeof views)[number];

export function PollTabs({ opening, mine }: { opening: View; mine: ReactNode }) {
  const [view, setView] = useState<View>(opening);

  return <Segment label="Widok" options={views} selected={view} onSelect={setView} panels={{ Moje: mine, Wszyscy: null }} />;
}
