"use client";

import { withViewTransition } from "@/shared/view-transition";
import { Segment } from "@/shared/ui/segment/segment";
import { useState, type ReactNode } from "react";
import styles from "./poll-page.module.css";

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
      {leads[view] && <div className={styles.lead}>{leads[view]}</div>}
      <Segment label="Widok" options={views} selected={view} onSelect={(next) => withViewTransition(() => setView(next))} panels={bodies} />
    </>
  );
}
