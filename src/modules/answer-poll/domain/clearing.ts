const stepMs = 120;
const longestMs = 600;

export function clearingStepMs(count: number) {
  return Math.min(stepMs, longestMs / count);
}
