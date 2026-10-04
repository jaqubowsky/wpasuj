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
          Administratorem jest {operator}. Zapisujemy tytuł, imiona, dni, godziny, termin i czas odpowiedzi oraz skróty kluczy z ciasteczek,
          żeby ankieta działała, art. 6 ust. 1 lit. b RODO. Bez imienia nie odpowiesz.
        </p>
      </LegalSection>
      <LegalSection title="Ciasteczka i jak długo">
        <p className="m-0">
          Dwa niezbędne ciasteczka na rok z kluczem do odpowiedzi i ankiety. Przeglądarka pamięta imię i wybór animacji. Ankieta znika po
          usunięciu albo przy sprzątaniu 60 dni po ostatnim dniu.
        </p>
      </LegalSection>
      <LegalSection title="Statystyki">
        <p className="m-0">
          Włączone Umami liczy wizyty i kroki ankiety. Dostaje typ kroku, ogólną ścieżkę, zatwierdzone kampanie i domenę źródła, IP i dane
          przeglądarki. Nie wysyłamy adresów ankiet, ich danych ani ciasteczek.
        </p>
      </LegalSection>
      <LegalSection title="Logi, zgłoszenia i kto je widzi">
        <p className="m-0">
          Logi bez imion, tytułów i kluczy leżą do 7 dni. „Zgłoś problem” wysyła opis, opcjonalny kontakt, adres strony, godzinę,
          przeglądarkę i rozmiar okna. IP trzymamy godzinę w pamięci przeciw spamowi, zgłoszenia i maile do końca sprawy, z uzasadnionego
          interesu, art. 6 ust. 1 lit. f RODO. Na nasze zlecenie Railway obsługuje serwer w UE, Linear zgłoszenia, a Cloudflare pocztę.
          Firmy z USA dostają dane na podstawie standardowych klauzul umownych UE albo EU-US Data Privacy Framework, zgodnie z umowami
          powierzenia.
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
