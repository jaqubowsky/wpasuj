import type { ReactNode } from "react";

const icons = {
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
  mail: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </>
  ),
};

type Icon = keyof typeof icons;

const itemLook =
  "box-border flex h-13 w-full cursor-pointer items-center gap-3 rounded-cell border-0 bg-transparent px-0 text-left font-sans text-base text-ink no-underline focus-visible:outline-2 focus-visible:outline-ink data-danger:font-semibold data-danger:text-accent-ink lg:h-11 lg:px-3";

function ItemIcon({ icon }: { icon: Icon }) {
  return (
    <svg className="size-4.5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {icons[icon]}
    </svg>
  );
}

export function MenuItem({ icon, danger, onClick, children }: { icon: Icon; danger?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className={itemLook} data-danger={danger || undefined} onClick={onClick}>
      <ItemIcon icon={icon} />
      {children}
    </button>
  );
}

export function MenuLink({ icon, href, newTab, onClick, children }: { icon: Icon; href: string; newTab?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <a className={itemLook} href={href} target={newTab ? "_blank" : undefined} rel={newTab ? "noopener" : undefined} onClick={onClick}>
      <ItemIcon icon={icon} />
      {children}
    </a>
  );
}
