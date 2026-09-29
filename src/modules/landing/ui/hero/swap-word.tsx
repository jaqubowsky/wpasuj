"use client";

import { useSwapWord } from "./use-swap-word";

export function SwapWord() {
  const { step, word, finalWord } = useSwapWord();

  return (
    <>
      <span className="sr-only">{finalWord}?</span>
      <span key={step} aria-hidden="true" className="inline-block data-swapped:animate-swap" data-swapped={step > 0 || undefined}>
        <span className="text-accent">{word}</span>?
      </span>
    </>
  );
}
