import { flushSync } from "react-dom";

export function withViewTransition(update: () => void | Promise<void>) {
  if (!("startViewTransition" in document) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    void update();
    return;
  }
  document.startViewTransition(() => flushSync(update));
}
