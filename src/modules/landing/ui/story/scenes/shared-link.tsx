import { linkScene } from "../../../domain/link-scene";
import type { SceneProps } from "../story-steps";

export function SharedLink({ time }: SceneProps) {
  const { preview, reply } = linkScene(time);

  return (
    <>
      <div className="mb-4 flex items-center gap-2.5 border-b border-line pb-3.5">
        <span aria-hidden className="grid size-8.5 place-items-center rounded-pill bg-tint-coral text-sm font-semibold">
          P
        </span>
        <div className="flex flex-col">
          <b className="font-display text-base font-bold tracking-tight">Paczka od liceum</b>
          <span className="text-xs text-muted">6 osób</span>
        </div>
      </div>
      <p className="m-0 max-w-4/5 rounded-[18px_18px_18px_6px] bg-track px-3.5 py-2.5 text-sm">
        <span className="block text-xs font-semibold text-muted">Kuba</span>
        Ej, planszówki w weekend? Kiedy możecie?
      </p>
      <p className="m-0 mt-1.5 mb-3 ml-1 text-xs text-muted">Wyświetlone przez 5 osób</p>
      <div
        data-in={preview || undefined}
        className="ml-auto w-21/25 translate-y-6 overflow-hidden rounded-[16px] opacity-0 shadow-[inset_0_0_0_1px_var(--color-line)] transition-[opacity,translate,scale] duration-(--duration-pop) ease-out motion-safe:scale-96 data-in:translate-y-0 data-in:opacity-100 motion-safe:data-in:scale-100"
      >
        <div className="grid grid-cols-[1fr_auto] items-center gap-2.5 bg-paper p-3.5">
          <div>
            <span className="mb-1 block text-xs whitespace-nowrap text-muted">Kuba pyta, kiedy możesz</span>
            <b className="block font-display text-lg leading-5 font-bold tracking-tightest">Planszówki u Michała</b>
          </div>
          <span aria-hidden data-tile-mark className="grid grid-cols-[repeat(2,--spacing(2))] gap-0.5">
            <span className="h-2 rounded-[2px] bg-accent" />
            <span className="h-2 rounded-[2px] bg-tint-coral" />
            <span className="h-2 rounded-[2px] bg-tint-coral" />
            <span className="h-2 rounded-[2px] bg-accent" />
          </span>
        </div>
        <p className="m-0 truncate bg-surface px-3 py-2 text-xs text-muted">wpasuj.pl · pt 17 – nd 19 paź</p>
      </div>
      <p
        data-in={reply || undefined}
        className="m-0 mt-2 ml-auto max-w-4/5 translate-y-3 rounded-[18px_18px_6px_18px] bg-ink px-3.5 py-2.5 text-sm text-surface opacity-0 transition-[opacity,translate] duration-(--duration-pop) ease-out data-in:translate-y-0 data-in:opacity-100"
      >
        Zaznaczcie tu, zajmie wam to 20 sekund
      </p>
    </>
  );
}
