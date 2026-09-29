"use client";

import { useSyncExternalStore } from "react";

const noChanges = () => () => {};

export function ThrowInBrowser() {
  const inBrowser = useSyncExternalStore(
    noChanges,
    () => true,
    () => false,
  );

  if (inBrowser) throw new Error("Demo client error");

  return <h1>Za chwilę błąd</h1>;
}
