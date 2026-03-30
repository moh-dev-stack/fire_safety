import type { VercelRequest } from "@vercel/node";
import { getCookie, SESSION_COOKIE, verifySessionToken } from "./session.js";

export async function isAuthenticated(req: VercelRequest): Promise<boolean> {
  const token = getCookie(req.headers.cookie, SESSION_COOKIE);
  if (!token) return false;
  return verifySessionToken(token);
}
