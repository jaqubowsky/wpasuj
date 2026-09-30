import Link from "next/link";
import type { ReactNode } from "react";

export function TextLink({ href, tone, children }: { href: string; tone?: "on-dark"; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center justify-center text-base font-bold text-ink underline decoration-2 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink data-[tone=on-dark]:text-paper data-[tone=on-dark]:focus-visible:outline-paper"
      data-tone={tone}
    >
      {children}
    </Link>
  );
}
