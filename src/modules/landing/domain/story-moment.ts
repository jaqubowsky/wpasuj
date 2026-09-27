export function storyMoment(progress: number, steps: number) {
  const position = Math.min(Math.max(progress, 0), 1) * steps;
  const step = Math.min(Math.floor(position), steps - 1);
  return { step, time: position - step };
}

type StoryMoment = ReturnType<typeof storyMoment>;

export function railFill({ step, time }: StoryMoment, steps: number) {
  return Math.min((step + 0.5 + time) / steps, 1);
}

export function sceneTime(index: number, { step, time }: StoryMoment) {
  if (index === step) return time;
  return index < step ? 1 : 0;
}
