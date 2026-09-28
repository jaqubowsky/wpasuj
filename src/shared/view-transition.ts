import { flushSync } from "react-dom";

export function withViewTransition(update: () => void) {
  if (!("startViewTransition" in document) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    update();

    return;
  }

  document.startViewTransition(() => flushSync(update));
}
