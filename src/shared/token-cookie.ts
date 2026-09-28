import { headers } from "next/headers";
import { createHash, randomBytes } from "node:crypto";

export async function tokenCookieOptions() {
  const secure = (await headers()).get("x-forwarded-proto") === "https";
  return { httpOnly: true, sameSite: "lax", path: "/", maxAge: 365 * 24 * 60 * 60, secure } as const;
}

export function newToken() {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
