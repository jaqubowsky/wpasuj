export function ChatHeader() {
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
    </>
  );
}
