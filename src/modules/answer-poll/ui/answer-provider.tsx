"use client";

import { createContext, use, type ReactNode } from "react";
import { useAnswer, type Answer } from "./use-answer";

type AnswerProviderProps = { pollId: string; dates: string[]; hours: number[]; mine?: Answer; children: ReactNode };

const AnswerContext = createContext<ReturnType<typeof useAnswer> | null>(null);

export function AnswerProvider({ children, ...options }: AnswerProviderProps) {
  return <AnswerContext value={useAnswer(options)}>{children}</AnswerContext>;
}

export function useAnswerContext() {
  const answer = use(AnswerContext);
  if (!answer) throw new Error("AnswerLead and AnswerBody render inside AnswerProvider");
  return answer;
}
