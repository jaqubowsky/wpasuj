import { Morph } from "@/shared/morph";
import type { ReactNode } from "react";
import { WaveEdge } from "../wave-edge/wave-edge";

type PollPosterProps = {
  tone: "coral" | "ink";
  eyebrow: ReactNode;
  title: string;
  morph?: string;
  children?: ReactNode;
};

export function PollPoster({ tone, eyebrow, title, morph, children }: PollPosterProps) {
  return (
    <>
      <header className="bg-accent text-ink data-[tone=ink]:bg-ink data-[tone=ink]:text-paper" data-poll-poster data-tone={tone}>
        <div className="mx-auto box-border grid max-w-150 gap-3.5 px-5 pt-6 pb-4 lg:max-w-280 lg:gap-5 lg:px-10 lg:pt-10 lg:pb-6">
          <p className="m-0 inline-flex min-h-8 items-center gap-2 justify-self-start rounded-pill bg-surface py-1 pr-3.5 pl-1 text-sm font-semibold text-ink">
            {eyebrow}
          </p>
          <Morph name={morph}>
            <h1 className="m-0 font-display text-4xl font-extrabold tracking-tightest text-balance wrap-anywhere lg:text-8xl">{title}</h1>
          </Morph>
          {children && <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">{children}</div>}
        </div>
      </header>
      <WaveEdge tone={tone} side="bottom" />
    </>
  );
}
