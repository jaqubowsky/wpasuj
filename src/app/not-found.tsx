import { AppHeader } from "./app-header";
import { MissingPage } from "./missing-page";
import { PageFrame } from "./page-frame";

export default function NotFound() {
  return (
    <PageFrame>
      <AppHeader />
      <MissingPage heading="Nie ma takiej strony" line="Sprawdź link albo zrób własną ankietę." />
    </PageFrame>
  );
}
