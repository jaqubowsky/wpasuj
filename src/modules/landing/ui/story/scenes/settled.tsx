import { Avatar } from "@/shared/ui/avatar/avatar";
import { invitation } from "../../../domain/best-scene";
import { PollHead } from "./poll-parts";

function SetBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill bg-ink px-3 py-1.5 text-sm font-semibold text-surface">
      <svg
        className="size-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
      Ustalone
    </span>
  );
}

function PeopleGroup({ label, names }: { label: string; names: string[] }) {
  return (
    <div>
      <div className="flex h-9 items-baseline justify-between pt-2 text-sm font-semibold">
        <span>{label}</span>
        <span>{names.length}</span>
      </div>
      {names.map((name) => (
        <span key={name} className="flex h-11 items-center gap-3 text-base">
          <Avatar name={name} tintKey={name.toLocaleLowerCase("pl")} mark={name === "Kuba" ? "organiser" : undefined} />
          {name}
        </span>
      ))}
    </div>
  );
}

export function Settled() {
  return (
    <>
      <PollHead line="Ustalone przez: Kuba" aside={<SetBadge />} />
      <div className="grid gap-4 rounded-card bg-ink p-5 text-surface">
        <p className="m-0 grid gap-1">
          <span className="text-sm text-on-dark-muted">Widzimy się</span>
          <span className="font-display text-3xl font-extrabold tracking-tightest">{invitation.weekday}</span>
          <span className="-mt-1 font-display text-3xl font-extrabold tracking-tightest">{invitation.day}</span>
          <span className="font-display text-2xl font-bold text-heat-3">{invitation.hours}</span>
        </p>
        <div className="grid gap-2">
          <span className="flex h-12 items-center justify-center gap-2 rounded-control bg-surface text-base font-semibold text-ink">
            <svg
              className="size-4.5 flex-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18M12 14v4M10 16h4" />
            </svg>
            Dodaj do kalendarza
          </span>
          <span className="grid h-12 place-items-center rounded-control text-base font-semibold shadow-[inset_0_0_0_1px_var(--color-muted)]">
            Wyślij termin na grupę
          </span>
        </div>
      </div>
      <div className="mt-3 rounded-card bg-surface px-5 pt-2 pb-3">
        <PeopleGroup label="Będzie" names={invitation.coming} />
      </div>
    </>
  );
}
