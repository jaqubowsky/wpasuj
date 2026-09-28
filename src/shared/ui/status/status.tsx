const words = {
  saving: "Zapisuję",
  saved: "Zapisane",
  failed: "Nie zapisano",
};

const glyphs = {
  saving: <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="28 10" />,
  saved: <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />,
  failed: (
    <>
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
};

type StatusProps = {
  state?: keyof typeof words;
};

export function Status({ state }: StatusProps) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-sm font-medium text-muted data-[state=failed]:text-accent-ink"
      role="status"
      data-state={state}
    >
      {state && (
        <>
          <svg className="size-4 flex-none" viewBox="0 0 16 16" aria-hidden="true">
            {glyphs[state]}
          </svg>
          {words[state]}
        </>
      )}
    </span>
  );
}
