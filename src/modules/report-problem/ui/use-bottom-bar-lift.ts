import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const pillZone = 76;

export function useBottomBarLift() {
  const path = usePathname();
  const [lift, setLift] = useState(0);

  useEffect(() => {
    function measure() {
      const height = document.documentElement.clientHeight;

      const covering = [...document.querySelectorAll("[data-bottom-bar]")]
        .map((bar) => bar.getBoundingClientRect())
        .filter((box) => box.top < height && box.bottom > height - pillZone);

      setLift(Math.max(0, ...covering.map((box) => height - box.top)));
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
