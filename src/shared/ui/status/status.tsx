import { useEffect, useState } from "react";
import { Icon } from "../icon/icon";

const words = {
  saving: "Zapisuję",
  saved: "Zapisane",
  failed: "Nie zapisano",
};

const glyphs = {
  saving: "pending",
  saved: "check-status",
  failed: "alert",
} as const;

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
          <Icon name={glyphs[state]} size={16} />
          {words[state]}
        </>
      )}
    </span>
  );
}
