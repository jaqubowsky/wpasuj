"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { useNearViewport } from "./use-near-viewport";

const Story = dynamic(() => import("./story/story").then((module) => module.Story), { ssr: false });
const Demo = dynamic(() => import("./demo/demo").then((module) => module.Demo), { ssr: false });

function NearViewport({ children }: { children: ReactNode }) {
  const { ref, near } = useNearViewport();
  return <div ref={ref}>{near && children}</div>;
}

export function LazyStory() {
  return (
    <NearViewport>
      <Story />
    </NearViewport>
  );
}

export function LazyDemo() {
  return (
    <NearViewport>
      <Demo />
    </NearViewport>
  );
}
