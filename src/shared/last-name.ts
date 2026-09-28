import { useSyncExternalStore } from "react";

const storageKey = "last-name";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);

  return () => window.removeEventListener("storage", onChange);
}

export function readLastName() {
  return localStorage.getItem(storageKey) ?? "";
}

export function useLastName() {
  return useSyncExternalStore(subscribe, readLastName, () => "");
}

export function rememberName(name: string) {
  localStorage.setItem(storageKey, name);
}
