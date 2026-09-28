"use client";

import type { ReactNode } from "react";
import { useResultsContext } from "./results-provider";

export function WhilePollLives({ gone, children }: { gone: ReactNode; children: ReactNode }) {
  return useResultsContext().gone ? gone : children;
}
