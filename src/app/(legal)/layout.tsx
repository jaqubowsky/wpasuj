import { SiteLinks } from "@/shared/ui/site-links/site-links";
import { TextLink } from "@/shared/ui/text-link/text-link";
import type { ReactNode } from "react";
import { AppHeader } from "../app-header";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AppHeader />
      {children}
      <footer className="flex flex-col items-center gap-2 pb-8">
        <TextLink href="/">Zrób własną ankietę</TextLink>
        <SiteLinks />
      </footer>
    </>
  );
}
