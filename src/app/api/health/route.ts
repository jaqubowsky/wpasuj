import { getDb } from "@/shared/db/client";
import { hasSiteUrl } from "@/shared/site-url";

export function GET() {
  getDb().$client.prepare("select 1").get();
  if (!hasSiteUrl()) return new Response("SITE_URL is not set to an http(s) URL", { status: 503 });

  return new Response("ok");
}
