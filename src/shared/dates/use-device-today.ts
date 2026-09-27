import { useSyncExternalStore } from "react";
import { todayIn } from "./iso-date";

function deviceToday() {
  return todayIn(Intl.DateTimeFormat().resolvedOptions().timeZone, new Date());
}

export function useDeviceToday() {
  return useSyncExternalStore(
    () => () => {},
    deviceToday,
    () => undefined,
  );
}
