import Link from "next/link";

const tiles = [2, 4, 1, 3, 0, 5, 1, 3, 2];

export function PollGone() {
  return (
    <main className="flex flex-col items-center justify-center gap-4 pt-24 pb-8 text-center">
      <div className="mb-2 grid grid-cols-[repeat(3,--spacing(8))] gap-1.5" aria-hidden="true">
        {tiles.map((heat, index) => (
          <span
            key={index}
            className="h-8 rounded-cell bg-paper shadow-[inset_0_0_0_2px_var(--color-edge)] data-heat:shadow-none data-[heat=1]:bg-heat-1 data-[heat=2]:bg-heat-2 data-[heat=3]:bg-heat-3 data-[heat=4]:bg-heat-4 data-[heat=5]:bg-heat-5"
            data-heat={heat || undefined}
          />
        ))}
      </div>
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
