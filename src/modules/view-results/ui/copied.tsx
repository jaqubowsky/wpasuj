import { Icon } from "@/shared/ui/icon/icon";
import type { ReactNode } from "react";
import "./copied.css";

export const copiedMs = 1600;

export function Check() {
  return (
    <span className="grid size-5 flex-none place-items-center rounded-pill bg-accent text-ink" aria-hidden="true">
      <Icon name="check-badge" size={12} />
    </span>
  );
}

export function Copied({ when, children }: { when: boolean; children: ReactNode }) {
  if (!when) return children;

  return (
    <span className="inline-flex items-center gap-2" data-copied>
      <Check />
      Skopiowano
    </span>
  );
}
