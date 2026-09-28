import { createHash, randomBytes } from "node:crypto";
import { siteUrl } from "./site-url";

export function tokenCookieOptions() {
  return { httpOnly: true, sameSite: "lax", path: "/", maxAge: 365 * 24 * 60 * 60, secure: siteUrl().protocol === "https:" } as const;
}

export function newToken() {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
