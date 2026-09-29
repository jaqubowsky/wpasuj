import type { ReactNode } from "react";
import { Icon, type IconName } from "../icon/icon";

const itemLook =
  "group/item box-border flex h-14.5 w-full cursor-pointer items-center gap-3 rounded-control border-0 bg-transparent px-3 text-left font-sans text-base font-semibold text-ink no-underline transition-[background-color,translate] duration-(--duration-fill) ease-out hover:bg-heat-1 focus-visible:outline-2 focus-visible:outline-ink data-danger:text-accent-ink motion-safe:hover:translate-x-1";

function ItemIcon({ icon }: { icon: IconName }) {
  return (
    <span className="grid size-8.5 flex-none place-items-center rounded-cell bg-track group-data-danger/item:bg-heat-2">
      <Icon name={icon} />
    </span>
  );
}

export function MenuItem({
  icon,
  danger,
  onClick,
  children,
}: {
  icon: IconName;
  danger?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button type="button" className={itemLook} data-danger={danger || undefined} onClick={onClick}>
      <ItemIcon icon={icon} />
      {children}
    </button>
  );
}

export function MenuLink({
  icon,
  href,
  newTab,
  onClick,
  children,
}: {
  icon: IconName;
  href: string;
  newTab?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <a className={itemLook} href={href} target={newTab ? "_blank" : undefined} rel={newTab ? "noopener" : undefined} onClick={onClick}>
      <ItemIcon icon={icon} />
      {children}
    </a>
  );
}
