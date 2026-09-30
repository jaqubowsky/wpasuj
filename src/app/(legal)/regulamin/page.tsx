import { contactAddress, productName } from "@/shared/brand";
import { TextLink } from "@/shared/ui/text-link/text-link";
import type { Metadata } from "next";
import { LegalPage, LegalSection } from "../legal-page";
import { operator } from "../operator";

const title = "Regulamin";

export const metadata: Metadata = {
  title: `${title} · ${productName}`,
  description: `Zasady korzystania z ${productName}: darmowo, bez konta, bez treści niezgodnych z prawem.`,
  alternates: { canonical: "/regulamin" },
};

export default function TermsPage() {
  return (
    <LegalPage title={title}>
      <LegalSection title="Co to za usługa">
        <p className="m-0">
          Darmowa ankieta terminów bez konta: zakładasz ankietę, wrzucasz link na grupę, każdy zaznacza godziny. Prowadzi ją {operator}.
        </p>
      </LegalSection>
      <LegalSection title="Umowa">
        <p className="m-0">
          Zawierasz ją, gdy zakładasz ankietę albo odpowiadasz, i kończysz, gdy przestajesz korzystać. Wystarczy aktualna przeglądarka z
          JavaScriptem i ciasteczkami.
        </p>
      </LegalSection>
      <LegalSection title="Czego nie wpisywać">
        <p className="m-0">
          W tytułach i imionach nic niezgodnego z prawem, obraźliwego, cudzych danych, reklam ani spamu. Taką ankietę możemy usunąć.
        </p>
      </LegalSection>
      <LegalSection title="Uważaj na link">
        <p className="m-0">
          Kto ma link do ankiety, może w niej odpowiedzieć, a link organizatora daje jego prawa. Nie wrzucaj ich publicznie.
        </p>
      </LegalSection>
      <LegalSection title="Usuwanie i gwarancje">
        <p className="m-0">
          Organizator usuwa ankietę przyciskiem „Usuń ankietę”, inaczej znika 60 dni po swoim ostatnim dniu. Usługa działa taka, jaka jest:
          może mieć przerwy i błędy.
        </p>
      </LegalSection>
      <LegalSection title="Reklamacje">
        <p className="m-0">Użyj „Zgłoś problem” albo napisz, odpowiemy w ciągu 14 dni. Nową wersję regulaminu publikujemy tutaj.</p>
        <TextLink href={`mailto:${contactAddress}`}>{contactAddress}</TextLink>
      </LegalSection>
    </LegalPage>
  );
}
