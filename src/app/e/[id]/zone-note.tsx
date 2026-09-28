"use client";

import { useDeviceTimeZone } from "@/shared/dates/use-device-time-zone";
import { Text } from "@/shared/ui/text/text";

export function ZoneNote({ pollZone }: { pollZone: string }) {
  const viewerZone = useDeviceTimeZone();
  if (!viewerZone || viewerZone === pollZone) return null;

  return (
    <Text as="p" variant="meta">
      Godziny w strefie {pollZone}
    </Text>
  );
}
