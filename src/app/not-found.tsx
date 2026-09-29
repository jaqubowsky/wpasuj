import { PageFrame } from "@/shared/ui/page-frame/page-frame";
import { AppHeader } from "./app-header";
import { MissingPage } from "./missing-page";

export default function NotFound() {
  return (
    <>
      <AppHeader />
      <PageFrame>
        <MissingPage heading="Nie ma takiej strony" line="Sprawdź link albo zrób własną ankietę." />
      </PageFrame>
    </>
  );
}
