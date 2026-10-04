import { ReportProblem } from "@/modules/report-problem/client";
import type { Metadata, Viewport } from "next";
import { productName } from "@/shared/brand";
import { cn } from "@/shared/ui/cn";
import { Grain } from "@/shared/ui/grain/grain";
import { Analytics } from "./analytics";
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
    <html lang="pl" className={cn(fontVariables, "scroll-pt-18")}>
      <body>
        <Analytics />
        <Grain />
        {children}
        <ReportProblem />
      </body>
    </html>
  );
}
