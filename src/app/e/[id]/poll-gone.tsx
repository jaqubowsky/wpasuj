import Link from "next/link";
import { GridMark } from "@/shared/ui/grid-mark/grid-mark";

export function PollGone() {
  return (
    <main className="flex flex-col items-center justify-center gap-4 pt-24 pb-8 text-center">
      <GridMark />
      <h1 className="m-0 font-display text-3xl font-bold tracking-tighter">Tej ankiety już nie ma</h1>
      <p className="m-0 text-base text-muted">Organizator ją usunął albo minął ostatni termin.</p>
      <Link
        href="/"
        className="box-border flex h-13 items-center justify-center self-stretch rounded-control bg-ink text-base font-semibold text-surface no-underline transition-transform duration-(--duration-fill) ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink motion-safe:active:scale-97"
      >
        Zrób własną ankietę
      </Link>
    </main>
  );
}
