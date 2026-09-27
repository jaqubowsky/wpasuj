import { createHash, randomBytes } from "node:crypto";

export const tokenCookieOptions = { httpOnly: true, sameSite: "lax", path: "/", maxAge: 365 * 24 * 60 * 60 } as const;

export function newToken() {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
