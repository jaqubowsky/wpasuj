import { useSyncExternalStore } from "react";

export function deviceTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function useDeviceTimeZone() {
  return useSyncExternalStore(
    () => () => {},
    deviceTimeZone,
    () => undefined,
  );
}
