"use client";

import type { ReactNode } from "react";
import { useResultsContext } from "./results-provider";

export function UntilSet({ invitation, children }: { invitation: ReactNode; children: ReactNode }) {
  return useResultsContext().results.final ? invitation : children;
}
