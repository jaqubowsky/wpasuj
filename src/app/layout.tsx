import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { productName } from "@/shared/brand";
import { cn } from "@/shared/ui/cn";
import "./globals.css";

const BricolageGrotesque = localFont({
  src: "../shared/fonts/bricolage-grotesque.woff2",
  weight: "700 800",
  variable: "--font-bricolage",
});

const Onest = localFont({
  src: "../shared/fonts/onest.woff2",
  weight: "400 600",
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
    <html lang="pl" className={cn(BricolageGrotesque.variable, Onest.variable)}>
      <body>{children}</body>
    </html>
  );
}
