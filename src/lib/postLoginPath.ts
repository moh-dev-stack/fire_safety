import type { SessionRole } from "../model/sessionRole";

export function postLoginPath(
  from: string | undefined,
  role: SessionRole | null,
): string {
  if (role === "user") {
    const blocked = new Set([
      "/",
      "/rota",
      "/venue-checklist",
      "/incidents/log",
      "/map",
      "/roles",
    ]);
    if (from && from !== "/login" && !blocked.has(from)) return from;
    return "/incidents";
  }
  return from && from !== "/login" ? from : "/";
}
