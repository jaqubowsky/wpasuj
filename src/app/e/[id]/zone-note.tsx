"use client";

import { useDeviceTimeZone } from "@/shared/dates/use-device-time-zone";
import { Text } from "@/shared/ui/text/text";
import { zoneLine } from "./zone-line";

export function ZoneNote({ pollZone }: { pollZone: string }) {
  const viewerZone = useDeviceTimeZone();
  const line = viewerZone && zoneLine(pollZone, viewerZone);
  if (!line) return null;

  return (
    <Text as="p" variant="meta">
      {line}
    </Text>
  );
}
