import localFont from "next/font/local";
import { cn } from "@/shared/ui/cn";

const BricolageGrotesque = localFont({
  src: "../shared/fonts/bricolage-grotesque.woff2",
  weight: "700 800",
  variable: "--font-bricolage",
  fallback: ["Bricolage Grotesque Fallback", "sans-serif"],
  adjustFontFallback: false,
});

const Onest = localFont({
  src: "../shared/fonts/onest.woff2",
  weight: "400 600",
  variable: "--font-onest",
  fallback: ["Onest Fallback", "sans-serif"],
  adjustFontFallback: false,
});

export const fontVariables = cn(BricolageGrotesque.variable, Onest.variable);
