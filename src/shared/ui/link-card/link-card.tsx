import { useId } from "react";

type LinkCardProps = {
  asker: string;
  title: string;
  host: string;
  note?: string;
};

export function LinkCard({ asker, title, host, note }: LinkCardProps) {
  const titleId = useId();

  return (
    <figure
      className="m-0 box-border w-full max-w-105 overflow-hidden rounded-card bg-surface text-left shadow-poster"
      aria-labelledby={titleId}
    >
      <div className="grid gap-1.5 bg-accent px-5 py-4.5 text-ink">
        <small className="text-xs">{asker}</small>
        <b id={titleId} className="font-display text-3xl font-extrabold tracking-tight wrap-anywhere">
          {title}
        </b>
      </div>
      <figcaption className="flex justify-between gap-3 px-5 py-2.5 text-sm text-muted">
        <span>{host}</span>
        {note && <span>{note}</span>}
      </figcaption>
    </figure>
  );
}
