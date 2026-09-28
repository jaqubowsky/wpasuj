import { ChatHeader } from "./chat-header";
import type { SceneProps } from "../story-steps";

export function SilentGroup({ time }: SceneProps) {
  return (
    <>
      <ChatHeader />
      <span
        aria-hidden
        data-typing={time < 0.7 || undefined}
        className="inline-flex gap-1 self-start rounded-[18px] bg-track px-3.5 py-3 opacity-0 transition-opacity duration-(--duration-pop) ease-out data-typing:opacity-100"
      >
        <span className="size-1.5 rounded-pill bg-muted" />
        <span className="size-1.5 rounded-pill bg-muted opacity-60" />
        <span className="size-1.5 rounded-pill bg-muted opacity-30" />
      </span>
    </>
  );
}
