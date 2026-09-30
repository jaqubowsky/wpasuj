import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function useBottomBarLift() {
  const path = usePathname();
  const [lift, setLift] = useState(0);

  useEffect(() => {
    function measure() {
      const height = document.documentElement.clientHeight;

      const pinned = [...document.querySelectorAll("[data-bottom-bar]")]
        .map((bar) => ({ bar, box: bar.getBoundingClientRect() }))
        .filter(({ bar, box }) => getComputedStyle(bar).position === "sticky" && Math.abs(box.bottom - height) <= 1);

      setLift(Math.max(0, ...pinned.map(({ box }) => box.height)));
    }

    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);

    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [path]);

  return lift;
}
