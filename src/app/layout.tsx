import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Onest } from "next/font/google";
import { productName } from "@/shared/brand";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  weight: ["700", "800"],
  variable: "--font-bricolage",
});

const sans = Onest({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-onest",
});

export const metadata: Metadata = {
  title: productName,
};

export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl" className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
