import type { SceneProps } from "../story-steps";

export function SilentGroup({ time }: SceneProps) {
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
      <span
        aria-hidden
        data-typing={time < 0.7 || undefined}
        className="inline-flex gap-1 self-start rounded-[18px] bg-track px-[14px] py-3 opacity-0 transition-opacity duration-(--duration-pop) ease-out data-typing:opacity-100"
      >
        <span className="size-[6px] rounded-pill bg-muted" />
        <span className="size-[6px] rounded-pill bg-muted opacity-60" />
        <span className="size-[6px] rounded-pill bg-muted opacity-30" />
      </span>
    </>
  );
}
