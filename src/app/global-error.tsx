"use client";

import { productName } from "@/shared/brand";
import { Grain } from "@/shared/ui/grain/grain";
import { ErrorPage } from "./error-page";
import { fontVariables } from "./fonts";
import { useRenderErrorReport } from "./use-render-error-report";
import "./globals.css";

export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useRenderErrorReport(error);

  return (
    <html lang="pl" className={fontVariables}>
      <body>
        <title>{productName}</title>
        <Grain />
        <ErrorPage retry={retry} />
      </body>
    </html>
  );
}
