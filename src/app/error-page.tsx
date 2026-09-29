import { Button } from "@/shared/ui/button/button";
import { GridMark } from "@/shared/ui/grid-mark/grid-mark";
import { TextLink } from "@/shared/ui/text-link/text-link";
import { AppHeader } from "./app-header";
import { PageFrame } from "./page-frame";

export function ErrorPage({ retry }: { retry: () => void }) {
  return (
    <>
      <AppHeader />
      <PageFrame>
        <main className="flex flex-col items-center justify-center gap-4 pt-24 pb-8 text-center">
          <GridMark />
          <h1 className="m-0 font-display text-3xl font-bold tracking-tighter text-balance lg:text-4xl">Coś poszło nie tak</h1>
          <p className="m-0 text-base text-muted">Spróbuj jeszcze raz. Jeśli dalej nie działa, zrób własną ankietę.</p>
          <div className="mt-2 flex flex-col gap-4 self-stretch">
            <Button variant="primary" block onClick={retry}>
              Spróbuj ponownie
            </Button>
            <TextLink href="/">Zrób własną ankietę</TextLink>
          </div>
        </main>
      </PageFrame>
    </>
  );
}
