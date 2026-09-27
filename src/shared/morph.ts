import type { CSSProperties } from "react";

const morph = (name: string): CSSProperties => ({ viewTransitionName: name, viewTransitionClass: "morph" });

export const pollTitleMorph = morph("poll-title");

export const dateMorph = (date: string) => morph(`poll-date-${date}`);
