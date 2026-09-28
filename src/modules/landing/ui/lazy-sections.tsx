"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { useNearViewport } from "./use-near-viewport";

const storyScreens = 8;
const demoScreens = 1;

function Placeholder({ screens }: { screens: number }) {
  return Array.from({ length: screens }, (_, screen) => <div key={screen} data-lazy-placeholder className="min-h-dvh" />);
}

const Story = dynamic(() => import("./story/story").then((module) => module.Story), {
  ssr: false,
  loading: () => <Placeholder screens={storyScreens} />,
});

const Demo = dynamic(() => import("./demo/demo").then((module) => module.Demo), {
  ssr: false,
  loading: () => <Placeholder screens={demoScreens} />,
});

function NearViewport({ id, screens, reach, children }: { id?: string; screens: number; reach: string; children: ReactNode }) {
  const { ref, near } = useNearViewport(reach);

  return (
    <div id={id} ref={ref} className="scroll-mt-18">
      {near ? children : <Placeholder screens={screens} />}
    </div>
  );
}

export function LazyStory() {
  return (
    <NearViewport id="jak-to-dziala" screens={storyScreens} reach="50% 0px">
      <Story />
    </NearViewport>
  );
}

export function LazyDemo({ formId }: { formId: string }) {
  return (
    <NearViewport screens={demoScreens} reach="200% 0px">
      <Demo formId={formId} />
    </NearViewport>
  );
}
