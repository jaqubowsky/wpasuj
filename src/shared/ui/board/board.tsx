import type { ReactNode } from "react";

export function Board({ children }: { children: ReactNode }) {
  return <section className="grid gap-3 rounded-card bg-surface p-4 shadow-poster lg:gap-4 lg:p-6">{children}</section>;
}
