import { contactAddress } from "@/shared/brand";
import { TextLink } from "../text-link/text-link";

export function SiteLinks({ tone }: { tone?: "on-dark" }) {
  return (
    <nav aria-label="Informacje" className="flex flex-wrap justify-center gap-x-6">
      <TextLink href="/polityka-prywatnosci" tone={tone}>
        Polityka prywatności
      </TextLink>
      <TextLink href="/regulamin" tone={tone}>
        Regulamin
      </TextLink>
      <TextLink href={`mailto:${contactAddress}`} tone={tone}>
        Kontakt
      </TextLink>
    </nav>
  );
}
