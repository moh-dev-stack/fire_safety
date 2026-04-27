import type { SessionRole } from "../../src/model/sessionRole.js";

/**
 * Resolves login username to `admin` or `user`. Matching is **case-insensitive**
 * and ignores leading/trailing whitespace (e.g. `User`, `USER`, `  admin  `).
 */
export function roleFromUsername(raw: string): SessionRole | null {
  const u = raw.trim().toLowerCase();
  if (u === "admin") return "admin";
  if (u === "user") return "user";
  return null;
}
