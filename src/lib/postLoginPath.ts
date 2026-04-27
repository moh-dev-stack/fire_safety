import type { SessionRole } from "../model/sessionRole";

export function postLoginPath(
  from: string | undefined,
  role: SessionRole | null,
): string {
  if (role === "user") {
    if (from && from !== "/login") {
      if (from === "/rota" || from === "/roles" || from.startsWith("/team")) {
        return "/";
      }
      const blocked = new Set([
        "/venue-checklist",
        "/incidents/log",
        "/map",
        "/help",
      ]);
      if (!blocked.has(from)) return from;
    }
    return "/";
  }
  return from && from !== "/login" ? from : "/";
}
