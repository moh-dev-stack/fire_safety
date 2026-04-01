import { SignJWT, jwtVerify } from "jose";
import type { SessionRole } from "../../src/model/sessionRole.js";

export const SESSION_COOKIE = "jalsa_session";

export type { SessionRole };

function getSecret(): Uint8Array {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error("SESSION_SECRET must be set (min 16 characters)");
  }
  return new TextEncoder().encode(s);
}

export async function createSessionToken(role: SessionRole): Promise<string> {
  return new SignJWT({ auth: "jalsa-fire-safety", role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function getSessionRoleFromToken(
  token: string,
): Promise<SessionRole | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const r = payload.role;
    if (r === "admin" || r === "user") return r;
    return null;
  } catch {
    return null;
  }
}

export function getCookie(
  cookieHeader: string | undefined,
  name: string,
): string | undefined {
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

export function setSessionCookie(res: { setHeader: (n: string, v: string) => void }, token: string) {
  const secure =
    process.env.VERCEL === "1" ||
    process.env.NODE_ENV === "production";
  const parts = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${60 * 60 * 24 * 7}`,
  ];
  if (secure) parts.push("Secure");
  res.setHeader("Set-Cookie", parts.join("; "));
}

export function clearSessionCookie(res: { setHeader: (n: string, v: string) => void }) {
  const secure =
    process.env.VERCEL === "1" ||
    process.env.NODE_ENV === "production";
  const parts = [
    `${SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ];
  if (secure) parts.push("Secure");
  res.setHeader("Set-Cookie", parts.join("; "));
}
