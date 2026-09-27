import { useEffect, useRef, useState } from "react";
import { storyMoment } from "../../domain/story-moment";

export function useStoryMoment(steps: number) {
  const ref = useRef<HTMLElement>(null);
  const [moment, setMoment] = useState({ step: 0, time: 0 });

  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      const box = ref.current!.getBoundingClientRect();
      setMoment(storyMoment(-box.top / (box.height - window.innerHeight), steps));
    };
    const schedule = () => {
      frame ||= requestAnimationFrame(read);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [steps]);

  return { ref, moment };
}
