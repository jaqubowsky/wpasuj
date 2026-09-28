import { getDb } from "@/shared/db/client";
import { hasSiteUrl } from "@/shared/site-url";
import Database from "better-sqlite3";

function writeFailure() {
  const sqlite = getDb().$client;

  try {
    sqlite.transaction(() => {
      const userVersion = sqlite.pragma("user_version", { simple: true });

      sqlite.pragma(`user_version = ${userVersion}`);
    })();

    return undefined;
  } catch (error) {
    if (error instanceof Database.SqliteError) return error.code;

    throw error;
  }
}

export function GET() {
  const failure = writeFailure();

  if (failure) return new Response(`the database cannot be written: ${failure}`, { status: 503 });
  if (!hasSiteUrl()) return new Response("SITE_URL is not set to an http(s) URL", { status: 503 });

  return new Response("ok");
}
