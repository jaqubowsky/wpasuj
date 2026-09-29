import { useEffect, useState } from "react";

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

const savedFor = 1600;

type StatusProps = {
  state?: keyof typeof words;
};

function useFadesWhenSaved(state: StatusProps["state"]) {
  const [shown, setShown] = useState(state);
  const [faded, setFaded] = useState(state === "saved");

  if (shown !== state) {
    setShown(state);
    setFaded(false);
  }

  useEffect(() => {
    if (state !== "saved") return;

    const timer = setTimeout(() => setFaded(true), savedFor);

    return () => clearTimeout(timer);
  }, [state]);

  return faded;
}

export function Status({ state }: StatusProps) {
  const faded = useFadesWhenSaved(state);

  return (
    <span
      className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-opacity duration-(--duration-turn) ease-out data-faded:opacity-0 data-[state=failed]:text-accent-ink data-[state=saved]:font-bold data-[state=saved]:text-accent-ink"
      role="status"
      data-state={state}
      data-faded={faded || undefined}
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
