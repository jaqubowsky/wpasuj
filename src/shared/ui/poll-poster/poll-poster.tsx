import { Morph } from "@/shared/morph";
import type { ReactNode } from "react";
import { PageFrame } from "../page-frame/page-frame";
import { WaveEdge } from "../wave-edge/wave-edge";

type PollPosterProps = {
  tone: "coral" | "ink";
  eyebrow: ReactNode;
  children?: ReactNode;
} & (
  { title: string; morph?: string; when?: never } | { when: { weekday: string; day: string; hours: string }; title?: never; morph?: never }
);

export function PollPoster({ tone, eyebrow, title, morph, when, children }: PollPosterProps) {
  return (
    <>
      <header className="bg-accent text-ink data-[tone=ink]:bg-ink data-[tone=ink]:text-paper" data-poll-poster data-tone={tone}>
        <PageFrame wide>
          <div className="grid gap-3.5 pt-6 pb-4 lg:gap-5 lg:pt-10 lg:pb-6">
            <p className="m-0 inline-flex min-h-8 items-center gap-2 justify-self-start rounded-pill bg-surface py-1 pr-3.5 pl-1 text-sm font-semibold text-ink">
              {eyebrow}
            </p>
            {when ? (
              <h1 className="m-0 grid font-display text-5xl font-extrabold tracking-tightest wrap-anywhere lg:text-9xl">
                <span>{when.weekday}</span> <span>{when.day}</span> <span className="text-paper">{when.hours}</span>
              </h1>
            ) : (
              <Morph name={morph}>
                <h1 className="m-0 font-display text-4xl font-extrabold tracking-tightest text-balance wrap-anywhere lg:text-8xl">
                  {title}
                </h1>
              </Morph>
            )}
            {(when || children) && (
              <div
                className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2 data-when:items-center"
                data-when={when ? true : undefined}
              >
                {when && (
                  <span className="inline-flex -rotate-4 items-center rounded-pill bg-ink px-3.5 py-1.5 text-sm font-extrabold text-paper">
                    Widzimy się
                  </span>
                )}
                {children}
              </div>
            )}
          </div>
        </PageFrame>
      </header>
      <WaveEdge tone={tone} side="bottom" />
    </>
  );
}
