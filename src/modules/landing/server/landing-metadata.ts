import { productName } from "@/shared/brand";
import type { Metadata } from "next";
import { pitch, tagline } from "../domain/pitch";

export function landingMetadata(site: URL): Metadata {
  return {
    metadataBase: site,
    title: { absolute: tagline },
    description: pitch,
    alternates: { canonical: "/" },
    openGraph: { type: "website", url: "/", siteName: productName, locale: "pl_PL", title: tagline, description: pitch },
    twitter: { card: "summary_large_image" },
  };
}
