import { getDb } from "@/shared/db/client";

export function GET() {
  getDb().$client.prepare("select 1").get();
  return new Response("ok");
}
