"use client";

import { useEffect } from "react";
import { setStopped, useStopped } from "./use-motion";

export function MotionToggle() {
  const stopped = useStopped();

  useEffect(() => {
    if (!stopped) return;

    document.documentElement.dataset.motion = "still";

    return () => {
      delete document.documentElement.dataset.motion;
    };
  }, [stopped]);

  return (
    <button
      type="button"
      className="box-border h-11 cursor-pointer rounded-pill border-2 border-solid border-ink bg-paper px-3.5 font-sans text-sm font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink motion-reduce:hidden lg:fixed lg:right-4 lg:bottom-4 lg:z-2"
      onClick={() => setStopped(!stopped)}
    >
      {stopped ? "Włącz ruch" : "Zatrzymaj ruch"}
    </button>
  );
}
