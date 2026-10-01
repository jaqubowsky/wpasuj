"use client";

import { lazy, Suspense } from "react";
import { useMyPolls, type FindPolls } from "./use-my-polls";

const MyPollsList = lazy(() => import("./my-polls-list"));

export function MyPolls({ findPolls }: { findPolls: FindPolls }) {
  const myPolls = useMyPolls();

  if (myPolls.count === 0 && !myPolls.listed) return null;

  return (
    <>
      <button
        type="button"
        className="box-border inline-flex h-11 cursor-pointer items-center gap-2 rounded-control border-0 bg-transparent px-3 font-sans text-base font-semibold text-ink transition-transform duration-(--duration-fill) ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink motion-safe:active:scale-97"
        aria-label={`Moje ankiety, ${myPolls.count}`}
        aria-haspopup="dialog"
        data-my-polls
        onClick={myPolls.open}
      >
        <span>
          Moje<span className="max-lg:hidden"> ankiety</span>
        </span>
        <span className="box-border inline-flex h-6 min-w-6 items-center justify-center rounded-pill bg-ink px-2 text-sm font-semibold text-surface tabular-nums">
          {myPolls.count}
        </span>
      </button>
      {myPolls.listed && (
        <Suspense fallback={null}>
          <MyPollsList findPolls={findPolls} listed={myPolls.listed} onClose={myPolls.close} />
        </Suspense>
      )}
    </>
  );
}
