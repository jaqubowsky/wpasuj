"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { useNearViewport } from "./use-near-viewport";

function Placeholder() {
  return <div className="min-h-dvh" />;
}

const Story = dynamic(() => import("./story/story").then((module) => module.Story), { ssr: false, loading: Placeholder });
const Demo = dynamic(() => import("./demo/demo").then((module) => module.Demo), { ssr: false, loading: Placeholder });

function NearViewport({ id, children }: { id?: string; children: ReactNode }) {
  const { ref, near } = useNearViewport();
  return (
    <div id={id} ref={ref} className="scroll-mt-[72px]">
      {near ? children : <Placeholder />}
    </div>
  );
}

export function LazyStory() {
  return (
    <NearViewport id="jak-to-dziala">
      <Story />
    </NearViewport>
  );
}

export function LazyDemo({ formId }: { formId: string }) {
  return (
    <NearViewport>
      <Demo formId={formId} />
    </NearViewport>
  );
}
