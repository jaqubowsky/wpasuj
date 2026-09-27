import { useSyncExternalStore } from "react";

const pinnable = "(min-width: 1280px) and (prefers-reduced-motion: no-preference)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(pinnable);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function usePinned() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(pinnable).matches,
    () => false,
  );
}
