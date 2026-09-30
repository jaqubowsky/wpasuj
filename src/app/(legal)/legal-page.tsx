import { PageFrame } from "@/shared/ui/page-frame/page-frame";
import { PollPoster } from "@/shared/ui/poll-poster/poll-poster";
import type { ReactNode } from "react";
import { edition } from "./operator";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <PollPoster tone="ink" eyebrow={<span className="pl-2.5">{edition}</span>} title={title} />
      <PageFrame>
        <main className="grid gap-4 pt-3 pb-4 lg:pt-8">{children}</main>
      </PageFrame>
    </>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid justify-items-start gap-1 text-base">
      <h2 className="m-0 font-display text-lg font-bold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}
