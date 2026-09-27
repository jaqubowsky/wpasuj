"use client";

import { Segment } from "@/shared/ui/segment/segment";
import { useState, type ReactNode } from "react";

const views = ["Moje", "Wszyscy"] as const;

export function PollTabs({ everyone }: { everyone: ReactNode }) {
  const [view, setView] = useState<(typeof views)[number]>("Moje");

  return <Segment label="Widok" options={views} selected={view} onSelect={setView} panels={{ Moje: null, Wszyscy: everyone }} />;
}
