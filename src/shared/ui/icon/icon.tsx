import type { ReactNode } from "react";

const drawings = {
  check: <path d="M20 6 9 17l-5-5" />,
  "check-status": <path d="M3.5 8.5l3 3 6-7" />,
  "check-badge": <path d="M2.5 6.2 5 8.5 9.5 3.5" strokeWidth="1.8" />,
  pending: <circle cx="8" cy="8" r="6" strokeLinecap="butt" strokeDasharray="28 10" />,
  alert: (
    <>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 5v3.5M8 11h.01" />
    </>
  ),
  crown: <path d="M3 7l4.5 4L12 4l4.5 7L21 7l-2 12H5z" fill="currentColor" stroke="none" />,
  cross: <path d="M18 6 6 18M6 6l12 12" strokeWidth="4" />,
  more: (
    <>
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </>
  ),
  "chevron-right": <path d="m9 18 6-6-6-6" />,
  copy: (
    <>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </>
  ),
  phone: (
    <>
      <rect x="6" y="2" width="12" height="20" rx="2" />
      <path d="M11 18h2" />
    </>
  ),
  trash: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />,
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>
  ),
  "calendar-square": <path d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4" />,
  clock: <path d="M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M12 7v5l3 2" />,
  mail: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </>
  ),
  link: (
    <>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </>
  ),
  report: (
    <>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M12 7v2M12 13h.01" />
    </>
  ),
  share: (
    <>
      <path d="M12 3v12" />
      <path d="m7 8 5-5 5 5" />
      <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
    </>
  ),
} satisfies Record<string, ReactNode>;

const grids: Partial<Record<IconName, number>> = { "check-status": 16, "check-badge": 12, pending: 16, alert: 16 };

export type IconName = keyof typeof drawings;

type IconProps = {
  name: IconName;
  size?: 8 | 12 | 14 | 16 | 18 | 20 | 24 | 32;
  stroke?: 1.5 | 2.25 | 2.5 | 2.75;
};

export function Icon({ name, size = 18, stroke = 1.5 }: IconProps) {
  const grid = grids[name] ?? 24;

  return (
    <svg
      className="flex-none"
      width={size}
      height={size}
      viewBox={`0 0 ${grid} ${grid}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {drawings[name]}
    </svg>
  );
}
