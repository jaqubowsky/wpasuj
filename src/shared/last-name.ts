import { useSyncExternalStore } from "react";

const storageKey = "last-name";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

export function useLastName() {
  return useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(storageKey) ?? "",
    () => "",
  );
}

export function rememberName(name: string) {
  localStorage.setItem(storageKey, name);
}
