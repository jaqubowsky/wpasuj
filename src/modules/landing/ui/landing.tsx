import { BrandMark } from "@/shared/ui/brand-mark/brand-mark";
import { WaveEdge } from "@/shared/ui/wave-edge/wave-edge";
import type { ReactNode } from "react";
import { Faq } from "./faq/faq";
import { Footer } from "./footer/footer";
import { GoToFormButton } from "./go-to-form-button";
import { Hero } from "./hero/hero";
import { Make } from "./make/make";
import { MyPolls } from "./my-polls/my-polls";
import type { FindPolls } from "./my-polls/use-my-polls";
import { Outro } from "./outro/outro";
import { Quote } from "./quote/quote";
import { TrySection } from "./try-poll/try-section";
import { Wall } from "./wall/wall";
import { WebApplicationJsonLd } from "./web-application-json-ld";

const formId = "utworz";

export function Landing({ form, home, findPolls }: { form: ReactNode; home: URL; findPolls: FindPolls }) {
  return (
    <>
      <WebApplicationJsonLd home={home} />
      <header className="group/header sticky top-0 z-1 box-border flex h-18 items-center justify-between gap-2 bg-paper px-5 lg:px-12">
        <BrandMark />
        <div className="flex items-center gap-2 lg:gap-3">
          <MyPolls findPolls={findPolls} />
          <GoToFormButton formId={formId}>
            <span>
              Utwórz<span className="max-lg:group-has-[[data-my-polls]]/header:hidden"> ankietę</span>
            </span>
          </GoToFormButton>
        </div>
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
