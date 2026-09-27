import { connection } from "next/server";

export async function siteUrl() {
  await connection();
  return new URL(process.env.SITE_URL!);
}
