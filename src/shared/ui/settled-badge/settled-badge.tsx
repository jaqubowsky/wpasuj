export function SettledBadge() {
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
