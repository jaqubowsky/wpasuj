import type { ReactNode } from "react";

type CardProps = {
  tone?: "ink";
  size?: "compact";
  label?: string;
  children: ReactNode;
};

export function Card({ tone, size, label, children }: CardProps) {
  return (
    <div
      className="group/card rounded-card bg-surface p-5 text-ink data-[size=compact]:rounded-control data-[size=compact]:px-4 data-[size=compact]:py-3 data-[tone=ink]:bg-ink data-[tone=ink]:text-surface"
      data-tone={tone}
      data-size={size}
    >
      {label && <span className="block text-label font-medium text-muted group-data-[tone=ink]/card:text-on-dark-muted">{label}</span>}
      {children}
    </div>
  );
}
