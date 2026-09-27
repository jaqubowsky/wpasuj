export function linkScene(time: number) {
  return { preview: time > 0.1, reply: time > 0.35 };
}
