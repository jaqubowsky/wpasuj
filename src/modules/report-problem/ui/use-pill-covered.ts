import { usePathname } from "next/navigation";
import { type RefObject, useEffect, useState } from "react";
import { observe } from "react-intersection-observer";

export function usePillCovered(pill: RefObject<HTMLElement | null>) {
  const path = usePathname();
  const [covered, setCovered] = useState(false);

  useEffect(() => {
    const pillStrip = pill.current!.offsetHeight + parseFloat(getComputedStyle(pill.current!.parentElement!).bottom);
    const underPill = new Set<Element>();

    const stops = [...document.querySelectorAll("[data-report-pill-clear]")].flatMap((element) => {
      let onScreen = false;
      let abovePill = false;

      function update() {
        if (onScreen && !abovePill) underPill.add(element);
        else underPill.delete(element);

        setCovered(underPill.size > 0);
      }

      return [
        observe(element, (inView) => {
          onScreen = inView;
          update();
        }),
        observe(
          element,
          (inView) => {
            abovePill = inView;
            update();
          },
          { rootMargin: `100% 0px -${pillStrip}px 0px`, threshold: 1 },
        ),
      ];
    });

    return () => {
      stops.forEach((stop) => stop());
      setCovered(false);
    };
  }, [path, pill]);

  return covered;
}
