import { cn } from "@/shared/ui/cn";
import type { CSSProperties, ReactNode } from "react";
import { railFill, sceneTime } from "../../domain/story-moment";
import { storySteps } from "./story-steps";
import { usePinned } from "./use-pinned";
import { useStoryMoment } from "./use-story-moment";

type Place = "past" | "now" | "next";

function placeOf(index: number, step: number): Place {
  if (index < step) return "past";
  return index === step ? "now" : "next";
}

function Caption({ step }: { step: (typeof storySteps)[number] }) {
  return (
    <>
      <span className="text-sm font-semibold text-accent-ink">{step.kicker}</span>
      <h2 className="m-0 font-display text-4xl font-extrabold tracking-tightest text-balance lg:text-6xl">
        {step.heading}
      </h2>
      <p className="m-0 max-w-150 text-base text-muted lg:text-xl">{step.body}</p>
    </>
  );
}

function Phone({ pinned, children }: { pinned?: boolean; children: ReactNode }) {
  return (
    <div
      data-pinned={pinned || undefined}
      className="box-border h-185 w-full data-pinned:h-[min(740px,82dvh)] max-w-90 self-center justify-self-center rounded-[52px] bg-ink p-3"
    >
      <div data-screen className="relative size-full overflow-hidden rounded-[41px] bg-paper">{children}</div>
    </div>
  );
}

function SceneSlot({ place, children }: { place?: Place; children: ReactNode }) {
  return (
    <div
      data-place={place}
      className="absolute inset-0 box-border flex flex-col px-5 pt-6.5 pb-5 data-place:invisible data-place:opacity-0 data-place:transition-[opacity,transform,visibility] data-place:duration-(--duration-pop) data-place:ease-out data-[place=next]:translate-y-7.5 data-[place=now]:visible data-[place=now]:opacity-100 data-[place=past]:-translate-y-7.5"
    >
      {children}
    </div>
  );
}

function PinnedStory() {
  const { ref, moment } = useStoryMoment(storySteps.length);

  return (
    <section ref={ref} aria-label="Jak to działa" className="relative h-[800dvh]">
      <div className="sticky top-0 h-dvh overflow-hidden">
        <div
          aria-hidden
          data-warm={storySteps[moment.step].warm}
          className="absolute inset-0 bg-warm opacity-0 transition-opacity duration-[600ms] ease-[ease] data-warm:opacity-100"
        />
        <div className="relative mx-auto box-border grid h-full max-w-wide grid-cols-[200px_minmax(0,1fr)_380px] items-center gap-14 px-12 pt-18">
          <div className="relative pl-5">
            <span className="absolute top-1.5 bottom-1.5 left-1 w-0.5 rounded-[1px] bg-line" />
            <span
              className="absolute top-1.5 bottom-1.5 left-1 w-0.5 origin-top rounded-[1px] bg-ink [transform:scaleY(var(--rail-fill))]"
              style={{ "--rail-fill": railFill(moment, storySteps.length) } as CSSProperties}
            />
            <ol aria-label="Kroki" className="m-0 flex list-none flex-col gap-4.5 p-0">
              {storySteps.map((step, index) => (
                <li
                  key={step.label}
                  aria-current={index === moment.step ? "step" : undefined}
                  className={cn("text-sm font-medium aria-[current=step]:font-bold", index <= moment.step ? "text-ink" : "text-muted")}
                >
                  {step.label}
                </li>
              ))}
            </ol>
          </div>
          <div className="relative h-105">
            {storySteps.map((step, index) => (
              <div
                key={step.label}
                data-place={placeOf(index, moment.step)}
                className="invisible absolute inset-0 flex flex-col justify-center gap-4.5 opacity-0 transition-[opacity,transform,visibility] duration-(--duration-pop) ease-out data-[place=next]:translate-y-10 data-[place=now]:visible data-[place=now]:opacity-100 data-[place=past]:-translate-y-10"
              >
                <Caption step={step} />
              </div>
            ))}
          </div>
          <Phone pinned>
            {storySteps.map(({ label, Scene }, index) => (
              <SceneSlot key={label} place={placeOf(index, moment.step)}>
                {Scene && <Scene time={sceneTime(index, moment)} />}
              </SceneSlot>
            ))}
          </Phone>
        </div>
      </div>
    </section>
  );
}

function StorySequence() {
  return (
    <section
      aria-label="Jak to działa"
      className="mx-auto box-border flex max-w-wide flex-col gap-20 px-5 py-20 lg:px-12"
    >
      {storySteps.map(({ Scene, ...step }) => (
        <div key={step.label} className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-center lg:gap-14">
          <div className="flex flex-col gap-3 lg:gap-4.5">
            <Caption step={step} />
          </div>
          <Phone>
            <SceneSlot>{Scene && <Scene time={1} />}</SceneSlot>
          </Phone>
        </div>
      ))}
    </section>
  );
}

export function Story() {
  return usePinned() ? <PinnedStory /> : <StorySequence />;
}
