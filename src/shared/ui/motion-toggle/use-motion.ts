import { useSyncExternalStore } from "react";
import { useMediaQuery } from "../../use-media-query";

const storageKey = "still-motion";
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);

  return () => listeners.delete(onChange);
}

export function setStopped(stopped: boolean) {
  localStorage.setItem(storageKey, stopped ? "1" : "0");
  listeners.forEach((listener) => listener());
}

export function useStopped() {
  return useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(storageKey) === "1",
    () => false,
  );
}

export function useMotion() {
  const allowed = useMediaQuery("(prefers-reduced-motion: no-preference)");
  const stopped = useStopped();

  return { moving: allowed && !stopped };
}
