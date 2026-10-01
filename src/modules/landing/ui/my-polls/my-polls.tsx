"use client";

import type { DevicePoll } from "@/shared/device-polls";
import { Button } from "@/shared/ui/button/button";
import { Sheet } from "@/shared/ui/sheet/sheet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { usePollRows, useMyPolls, type FindPolls } from "./use-my-polls";

const label = "Twoje ankiety";

function Rows({ findPolls, listed }: { findPolls: FindPolls; listed: DevicePoll[] }) {
  const rows = usePollRows(findPolls, listed);

  if (rows.isPending) return <p className="m-0 text-sm font-medium text-muted">Wczytuję</p>;

  if (rows.isError)
    return (
      <div className="flex flex-wrap items-center gap-x-3">
        <p className="m-0 text-sm font-medium text-muted">Nie udało się wczytać ankiet.</p>
        <Button variant="text" onClick={() => rows.refetch()}>
          Spróbuj ponownie
        </Button>
      </div>
    );

  if (rows.data.length === 0) return <p className="m-0 text-sm font-medium text-muted">Tych ankiet już nie ma.</p>;

  return (
    <ul className="m-0 grid list-none gap-2 p-0">
      {rows.data.map((row) => (
        <li key={row.id}>
          <Link
            href={`/e/${row.id}`}
            className="box-border grid gap-1 rounded-control bg-surface px-4 py-3.5 text-ink no-underline shadow-[inset_0_0_0_1px_var(--color-edge)] transition-transform duration-(--duration-fill) ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink motion-safe:active:scale-97"
          >
            <span className="font-display text-lg font-bold tracking-tight wrap-break-word">{row.title}</span>
            <span className="text-sm font-medium text-muted tabular-nums">{row.roleLine}</span>
            <span
              className="text-sm font-medium text-muted tabular-nums data-settled:font-semibold data-settled:text-ink"
              data-settled={row.status.settled || undefined}
            >
              {row.status.line}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function MyPolls({ findPolls }: { findPolls: FindPolls }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }));
  const myPolls = useMyPolls();

  if (myPolls.count === 0 && !myPolls.listed) return null;

  return (
    <QueryClientProvider client={client}>
      <button
        type="button"
        className="box-border inline-flex h-11 cursor-pointer items-center gap-2 rounded-control border-0 bg-transparent px-3 font-sans text-base font-semibold text-ink transition-transform duration-(--duration-fill) ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink motion-safe:active:scale-97"
        aria-label={`Moje ankiety, ${myPolls.count}`}
        aria-haspopup="dialog"
        data-my-polls
        onClick={myPolls.open}
      >
        <span>
          Moje<span className="max-lg:hidden"> ankiety</span>
        </span>
        <span className="box-border inline-flex h-6 min-w-6 items-center justify-center rounded-pill bg-ink px-2 text-sm font-semibold text-surface tabular-nums">
          {myPolls.count}
        </span>
      </button>
      {myPolls.listed && (
        <Sheet label={label} sidePanel onClose={myPolls.close}>
          <div className="mb-4 grid gap-1">
            <div className="flex items-center justify-between gap-3">
              <h2 className="m-0 font-display text-2xl font-bold tracking-tighter">{label}</h2>
              <Button variant="text" onClick={myPolls.close}>
                Zamknij
              </Button>
            </div>
            <p className="m-0 text-sm font-medium text-muted lg:hidden">Widać je tylko na tym telefonie.</p>
            <p className="m-0 text-sm font-medium text-muted max-lg:hidden">Widać je tylko w tej przeglądarce.</p>
          </div>
          <Rows findPolls={findPolls} listed={myPolls.listed} />
        </Sheet>
      )}
    </QueryClientProvider>
  );
}
