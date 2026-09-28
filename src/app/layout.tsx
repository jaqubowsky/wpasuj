import type { Metadata, Viewport } from "next";
import { productName } from "@/shared/brand";
import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: productName,
};

export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
