import type { ReactNode } from "react";
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
      <span className="text-bubble font-semibold text-accent-ink">{step.kicker}</span>
      <h2 className="m-[0] font-display text-title-desktop font-extrabold tracking-[-0.03em] text-balance lg:text-story">
        {step.heading}
      </h2>
      <p className="m-[0] max-w-[30em] text-body text-muted lg:text-story-lead">{step.body}</p>
    </>
  );
}

function Phone({ children }: { children: ReactNode }) {
  return (
    <div className="box-border h-[min(740px,82dvh)] w-full max-w-[360px] self-center justify-self-center rounded-[52px] bg-ink p-3">
      <div className="relative size-full overflow-hidden rounded-[41px] bg-paper">{children}</div>
    </div>
  );
}

function SceneSlot({ place, children }: { place?: Place; children: ReactNode }) {
  return (
    <div
      data-place={place}
      className="absolute inset-[0] box-border flex flex-col px-5 pt-[26px] pb-5 data-place:invisible data-place:opacity-0 data-place:transition-[opacity,transform,visibility] data-place:duration-(--duration-pop) data-place:ease-out data-[place=next]:translate-y-[30px] data-[place=now]:visible data-[place=now]:opacity-100 data-[place=past]:-translate-y-[30px]"
    >
      {children}
    </div>
  );
}

function PinnedStory() {
  const { ref, moment } = useStoryMoment(storySteps.length);

  return (
    <section ref={ref} aria-label="Jak to działa" className="relative h-[800dvh]">
      <div className="sticky top-[0] h-dvh overflow-hidden">
        <div
          aria-hidden
          data-warm={storySteps[moment.step].warm}
          className="absolute inset-[0] bg-warm opacity-0 transition-opacity duration-[600ms] ease-[ease] data-warm:opacity-100"
        />
        <div className="relative mx-auto box-border grid h-full max-w-[1280px] grid-cols-[200px_minmax(0,1fr)_380px] items-center gap-[56px] px-[48px] pt-[72px]">
          <div className="relative pl-5">
            <span className="absolute top-[6px] bottom-[6px] left-[3px] w-[2px] rounded-[1px] bg-line" />
            <span
              className="absolute top-[6px] bottom-[6px] left-[3px] w-[2px] origin-top rounded-[1px] bg-ink"
              style={{ transform: `scaleY(${railFill(moment, storySteps.length)})` }}
            />
            <ol aria-label="Kroki" className="m-[0] flex list-none flex-col gap-[18px] p-[0]">
              {storySteps.map((step, index) => (
                <li
                  key={step.label}
                  aria-current={index === moment.step ? "step" : undefined}
                  className={`text-bubble font-medium aria-[current=step]:font-bold ${index <= moment.step ? "text-ink" : "text-muted"}`}
                >
                  {step.label}
                </li>
              ))}
            </ol>
          </div>
          <div className="relative h-[420px]">
            {storySteps.map((step, index) => (
              <div
                key={step.label}
                data-place={placeOf(index, moment.step)}
                className="invisible absolute inset-[0] flex flex-col justify-center gap-[18px] opacity-0 transition-[opacity,transform,visibility] duration-(--duration-pop) ease-out data-[place=next]:translate-y-10 data-[place=now]:visible data-[place=now]:opacity-100 data-[place=past]:-translate-y-10"
              >
                <Caption step={step} />
              </div>
            ))}
          </div>
          <Phone>
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
      className="mx-auto box-border flex max-w-[1280px] flex-col gap-[80px] px-5 py-[80px] lg:px-[48px]"
    >
      {storySteps.map(({ Scene, ...step }) => (
        <div key={step.label} className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-center lg:gap-[56px]">
          <div className="flex flex-col gap-3 lg:gap-[18px]">
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
