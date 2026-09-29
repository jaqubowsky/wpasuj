import Link from "next/link";
import { GridMark } from "@/shared/ui/grid-mark/grid-mark";

export function MissingPage({ heading, line }: { heading: string; line: string }) {
  return (
    <main className="flex flex-col items-center justify-center gap-4 pt-24 pb-8 text-center">
      <GridMark />
      <h1 className="m-0 font-display text-3xl font-bold tracking-tighter text-balance lg:text-4xl">{heading}</h1>
      <p className="m-0 text-base text-muted">{line}</p>
      <Link
        href="/"
        className="mt-2 box-border flex h-13 items-center justify-center self-stretch rounded-control bg-ink text-base font-semibold text-surface no-underline shadow-ledge shadow-heat-5 transition-[translate,box-shadow] duration-(--duration-fill) ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-ledge-up motion-safe:active:translate-y-1.5 motion-safe:active:shadow-ledge-down"
      >
        Zrób własną ankietę
      </Link>
    </main>
  );
}
