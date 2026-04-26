import type { VercelRequest } from "@vercel/node";
import {
  getCookie,
  getSessionRoleFromToken,
  SESSION_COOKIE,
  type SessionRole,
} from "./session.js";

export type { SessionRole };

export async function getRole(
  req: VercelRequest,
): Promise<SessionRole | null> {
  const token = getCookie(req.headers.cookie, SESSION_COOKIE);
  if (!token) return null;
  return getSessionRoleFromToken(token);
}

export async function isAuthenticated(req: VercelRequest): Promise<boolean> {
  const role = await getRole(req);
  return role !== null;
}
