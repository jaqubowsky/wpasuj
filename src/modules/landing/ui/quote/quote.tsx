"use client";

import { LinkCard } from "@/shared/ui/link-card/link-card";
import type { CSSProperties } from "react";
import "./quote.css";
import { useCountUp } from "./use-count-up";

const messages = 47;

const ghosts = [
  { name: "Bartek", line: "to niedziela?", left: "9%", top: "5%", turn: -2 },
  { name: "Zuza", line: "piątek nie mogę", left: "63%", top: "3%", turn: 3 },
  { name: "Michał", line: "sobota do 18 praca", left: "4%", top: "42%", turn: -4 },
  { name: "Ola", line: "halo?", left: "82%", top: "36%", turn: 2 },
  { name: "Kasia", line: "a przyszły weekend?", left: "16%", top: "88%", turn: -3 },
  { name: "Michał", line: "sorry, przewinąłem", left: "70%", top: "90%", turn: 4 },
];

export function Quote({ host }: { host: string }) {
  const { ref, count } = useCountUp(messages);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-ink px-5 pt-35 pb-37.5 text-center text-paper"
      aria-labelledby="quote-heading"
    >
      <div aria-hidden="true" className="max-lg:hidden">
        {ghosts.map((ghost) => (
          <div
            key={ghost.line}
            className="text-sm font-semibold whitespace-nowrap text-paper/25"
            data-quote-ghost
            style={{ "--ghost-left": ghost.left, "--ghost-top": ghost.top, "--ghost-turn": `${ghost.turn}deg` } as CSSProperties}
          >
            <b className="block text-xs font-semibold text-accent/35">{ghost.name}</b>
            {ghost.line}
          </div>
        ))}
      </div>
      <div className="relative mx-auto max-w-wide">
        <h2 id="quote-heading" className="m-0 font-sans text-6xl font-semibold tracking-tightest italic lg:text-9xl">
          <span className="text-accent">„</span>A może w piątek?<span className="text-accent">”</span>
        </h2>
        <p className="mx-auto mt-8.5 mb-0 max-w-150 text-lg text-balance text-on-dark-muted lg:text-xl">
          Zdanie, od którego zaczyna się każda grupowa rozmowa. I którym się kończy, bo nikt już nie wie, kto kiedy może.
        </p>
        <p className="mt-7 mb-0 inline-flex items-baseline gap-2.5 font-display text-2xl font-extrabold text-heat-3">
          <span aria-hidden="true" className="text-6xl tracking-tightest tabular-nums">
            {count}
          </span>
          <span className="sr-only">{messages}</span> wiadomości później
        </p>
        <div
          className="mx-auto mt-11.5 flex max-w-105 -rotate-2 justify-center opacity-0 transition-[scale,opacity] duration-(--duration-reveal) ease-spring data-seen:opacity-100 motion-safe:scale-60 motion-safe:data-seen:scale-100"
          data-seen={count === messages || undefined}
        >
          <LinkCard
            asker="Kuba pyta, kiedy możesz"
            title="Grill na działce u Oli"
            tone="coral"
            host={host}
            note="jeden link zamiast wszystkiego"
          />
        </div>
      </div>
    </section>
  );
}
