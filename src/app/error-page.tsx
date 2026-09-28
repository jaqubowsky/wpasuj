import Link from "next/link";
import { Button } from "@/shared/ui/button/button";
import { AppHeader } from "./app-header";
import { PageFrame } from "./page-frame";

export function ErrorPage({ retry }: { retry: () => void }) {
  return (
    <PageFrame>
      <AppHeader />
      <main className="flex flex-col items-center justify-center gap-4 pt-24 pb-8 text-center">
        <h1 className="m-0 font-display text-3xl font-bold tracking-tighter">Coś poszło nie tak</h1>
        <p className="m-0 text-base text-muted">Spróbuj jeszcze raz. Jeśli dalej nie działa, zrób nową ankietę.</p>
        <div className="flex flex-col gap-2 self-stretch">
          <Button variant="primary" block onClick={retry}>
            Spróbuj ponownie
          </Button>
          <Link href="/" className="flex min-h-11 items-center justify-center text-base font-medium text-muted underline underline-offset-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
            Zrób nową ankietę
          </Link>
        </div>
      </main>
    </PageFrame>
  );
}
