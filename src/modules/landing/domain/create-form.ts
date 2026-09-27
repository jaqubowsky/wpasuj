const title = "Planszówki u Michała";

export function createFormAt(time: number) {
  return {
    title: title.slice(0, Math.floor(Math.min(time * 1.8, 1) * title.length)),
    weekend: time > 0.55,
    evening: time > 0.72,
    pressed: time > 0.88 && time < 1,
  };
}
