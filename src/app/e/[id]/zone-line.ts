export function zoneLine(pollZone: string, viewerZone: string) {
  if (pollZone === viewerZone) return undefined;
  return `Godziny w strefie ${pollZone}`;
}
