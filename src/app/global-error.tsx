"use client";

import { productName } from "@/shared/brand";
import { ErrorPage } from "./error-page";
import { fontVariables } from "./fonts";
import "./globals.css";

export default function GlobalError({ retry }: { retry: () => void }) {
  return (
    <html lang="pl" className={fontVariables}>
      <body>
        <title>{productName}</title>
        <ErrorPage retry={retry} />
      </body>
    </html>
  );
}
