"use client";

import type { DevicePoll } from "@/shared/device-polls";
import { Button } from "@/shared/ui/button/button";
import { Sheet } from "@/shared/ui/sheet/sheet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import type { FindPolls } from "./use-my-polls";
import { usePollRows } from "./use-poll-rows";

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

export default function MyPollsList({ findPolls, listed, onClose }: { findPolls: FindPolls; listed: DevicePoll[]; onClose: () => void }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }));

  return (
    <QueryClientProvider client={client}>
      <Sheet label={label} sidePanel onClose={onClose}>
        <div className="mb-4 grid gap-1">
          <div className="flex items-center justify-between gap-3">
            <h2 className="m-0 font-display text-2xl font-bold tracking-tighter">{label}</h2>
            <Button variant="text" onClick={onClose}>
              Zamknij
            </Button>
          </div>
          <p className="m-0 text-sm font-medium text-muted lg:hidden">Widać je tylko na tym telefonie.</p>
          <p className="m-0 text-sm font-medium text-muted max-lg:hidden">Widać je tylko w tej przeglądarce.</p>
        </div>
        <Rows findPolls={findPolls} listed={listed} />
      </Sheet>
    </QueryClientProvider>
  );
}
