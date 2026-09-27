import { ViewTransition, type ReactNode } from "react";

export const pollTitleMorph = "poll-title";

export const dateMorph = (date: string) => `poll-date-${date}`;

export function Morph({ name, children }: { name?: string; children: ReactNode }) {
  return (
    <ViewTransition name={name} share="morph" default="none">
      {children}
    </ViewTransition>
  );
}
