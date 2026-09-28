import { useSyncExternalStore } from "react";
import { todayIn } from "./iso-date";
import { deviceTimeZone } from "./use-device-time-zone";

function deviceToday() {
  return todayIn(deviceTimeZone(), new Date());
}

export function useDeviceToday() {
  return useSyncExternalStore(
    () => () => {},
    deviceToday,
    () => undefined,
  );
}
