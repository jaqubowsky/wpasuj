"use client";

import { Segment } from "@/shared/ui/segment/segment";
import { useState } from "react";

const views = ["Moje", "Wszyscy"] as const;

export function PollTabs() {
  const [view, setView] = useState<(typeof views)[number]>("Moje");

  return <Segment label="Widok" options={views} selected={view} onSelect={setView} panels={{ Moje: null, Wszyscy: null }} />;
}
