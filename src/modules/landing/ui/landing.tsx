import { BrandMark } from "@/shared/ui/brand-mark/brand-mark";
import { WaveEdge } from "@/shared/ui/wave-edge/wave-edge";
import type { ReactNode } from "react";
import { Faq } from "./faq/faq";
import { Footer } from "./footer/footer";
import { GoToFormButton } from "./go-to-form-button";
import { Hero } from "./hero/hero";
import { Make } from "./make/make";
import { Outro } from "./outro/outro";
import { Quote } from "./quote/quote";
import { TrySection } from "./try-poll/try-section";
import { Wall } from "./wall/wall";
import { WebApplicationJsonLd } from "./web-application-json-ld";

const formId = "utworz";

export function Landing({ form, home }: { form: ReactNode; home: URL }) {
  return (
    <>
      <WebApplicationJsonLd home={home} />
      <header className="sticky top-0 z-1 box-border flex h-18 items-center justify-between bg-paper px-5 lg:px-12">
        <BrandMark />
        <GoToFormButton formId={formId}>Utwórz ankietę</GoToFormButton>
      </header>
      <main>
        <Hero formId={formId} />
        <WaveEdge tone="ink" side="top" />
        <Quote host={home.host} />
        <WaveEdge tone="ink" side="bottom" />
        <TrySection />
        <WaveEdge tone="coral" side="top" />
        <Wall />
        <WaveEdge tone="coral" side="bottom" />
        <Make formId={formId} form={form} />
        <Faq />
        <WaveEdge tone="ink" side="top" />
        <Outro formId={formId} />
      </main>
      <Footer />
    </>
  );
}
