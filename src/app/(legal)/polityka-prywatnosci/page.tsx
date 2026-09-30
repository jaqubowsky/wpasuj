import { contactAddress, productName } from "@/shared/brand";
import { TextLink } from "@/shared/ui/text-link/text-link";
import type { Metadata } from "next";
import { LegalPage, LegalSection } from "../legal-page";
import { operator } from "../operator";

const title = "Polityka prywatności";

export const metadata: Metadata = {
  title: `${title} · ${productName}`,
  description: `Co ${productName} zapisuje, gdzie i na jak długo.`,
  alternates: { canonical: "/polityka-prywatnosci" },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title={title}>
      <LegalSection title="Kto i co zapisuje">
        <p className="m-0">
          Administratorem jest {operator}. Zapisujemy ankietę (tytuł, imię organizatora, dni, godziny, termin), imiona, godziny i czas
          odpowiedzi oraz skróty kluczy z ciasteczek, żeby ankieta działała (art. 6 ust. 1 lit. b RODO). Bez imienia nie odpowiesz.
        </p>
      </LegalSection>
      <LegalSection title="Ciasteczka i jak długo">
        <p className="m-0">
          Dwa niezbędne ciasteczka na rok z kluczem do Twojej odpowiedzi i ankiety. Przeglądarka pamięta też Twoje imię i to, czy wyłączasz
          animacje. Bez analityki, reklam i kont. Ankieta znika 60 dni po ostatnim dniu (z bazy przy kolejnym sprzątaniu) albo po „Usuń
          ankietę”.
        </p>
      </LegalSection>
      <LegalSection title="Logi, zgłoszenia i kto je widzi">
        <p className="m-0">
          Logi serwera bez imion, tytułów i kluczy leżą do 7 dni. „Zgłoś problem” wysyła opis, kontakt (jeśli podasz), adres strony,
          godzinę, przeglądarkę i rozmiar okna. IP trzymamy godzinę w pamięci przeciw spamowi, zgłoszenia i maile do końca sprawy
          (uzasadniony interes, art. 6 ust. 1 lit. f RODO). Na nasze zlecenie widzą je Railway (serwer w UE), Linear (zgłoszenia) i
          Cloudflare (poczta). To firmy z USA, dane dostają na podstawie standardowych klauzul umownych UE albo EU‑US Data Privacy
          Framework, jak mówią ich umowy powierzenia.
        </p>
      </LegalSection>
      <LegalSection title="Twoje prawa">
        <p className="m-0">
          Dostęp, poprawienie, usunięcie, ograniczenie, przeniesienie, sprzeciw: napisz, podając link i imię. Skarga: Prezes UODO. Nie
          profilujemy.
        </p>
        <TextLink href={`mailto:${contactAddress}`}>{contactAddress}</TextLink>
      </LegalSection>
    </LegalPage>
  );
}
