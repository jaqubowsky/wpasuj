import { linkScene } from "../../../domain/link-scene";
import type { SceneProps } from "../story-steps";

const miniGridCells = 6;

export function SharedLink({ time }: SceneProps) {
  const { preview, reply } = linkScene(time);

  return (
    <>
      <div className="mb-4 flex items-center gap-[10px] border-b border-line pb-[14px]">
        <span aria-hidden className="grid size-[34px] place-items-center rounded-pill bg-tint-coral text-label font-semibold">
          P
        </span>
        <div className="flex flex-col">
          <b className="font-display text-body font-bold tracking-[-0.01em]">Paczka od liceum</b>
          <span className="text-mini text-muted">6 osób</span>
        </div>
      </div>
      <p className="m-[0] max-w-[80%] rounded-[18px_18px_18px_6px] bg-track px-[14px] py-[10px] text-bubble">
        <span className="block text-mini font-semibold text-muted">Kuba</span>
        Ej, planszówki w weekend? Kiedy możecie?
      </p>
      <p className="m-[0] mt-[6px] mb-3 ml-1 text-mini text-muted">Wyświetlone przez 5 osób</p>
      <div
        data-in={preview || undefined}
        className="ml-auto w-[84%] translate-y-6 overflow-hidden rounded-[16px] opacity-0 shadow-[inset_0_0_0_1px_var(--color-line)] transition-[opacity,translate,scale] duration-(--duration-pop) ease-out motion-safe:scale-96 data-in:translate-y-[0] data-in:opacity-100 motion-safe:data-in:scale-100"
      >
        <div className="grid grid-cols-[1fr_70px] items-center gap-[10px] bg-paper p-[14px]">
          <div>
            <span className="mb-1 block text-mini whitespace-nowrap text-muted">Kuba pyta, kiedy możesz</span>
            <b className="font-display text-section font-bold tracking-[-0.03em]">Planszówki u Michała</b>
          </div>
          <div aria-hidden className="grid grid-cols-3 gap-[3px]">
            {Array.from({ length: miniGridCells }, (_, cell) => (
              <span key={cell} className="h-[9px] rounded-[3px] shadow-[inset_0_0_0_1px_var(--color-edge)]" />
            ))}
          </div>
        </div>
        <p className="m-[0] bg-surface px-3 py-2 text-mini text-muted">wpasuj.app · pt 17 – nd 19 października</p>
      </div>
      <p
        data-in={reply || undefined}
        className="m-[0] mt-2 ml-auto max-w-[80%] translate-y-3 rounded-[18px_18px_6px_18px] bg-ink px-[14px] py-[10px] text-bubble text-surface opacity-0 transition-[opacity,translate] duration-(--duration-pop) ease-out data-in:translate-y-[0] data-in:opacity-100"
      >
        Zaznaczcie tu, zajmie wam to 20 sekund
      </p>
    </>
  );
}
