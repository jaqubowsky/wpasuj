import { siteUrl } from "@/shared/site-url";
import type { MetadataRoute } from "next";
import { connection } from "next/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();

  return ["/", "/polityka-prywatnosci", "/regulamin", "/jak-ustalic-termin"].map((path) => ({ url: new URL(path, siteUrl()).href }));
}
