import { useSyncExternalStore } from "react";

function deviceTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function useDeviceTimeZone() {
  return useSyncExternalStore(
    () => () => {},
    deviceTimeZone,
    () => undefined,
  );
}
