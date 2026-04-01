import type { VercelRequest } from "@vercel/node";

function stringifyQueryValue(v: unknown): string | undefined {
  if (typeof v === "string" && v.length > 0) return v;
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  if (Array.isArray(v)) {
    const first = v[0];
    if (typeof first === "string" && first.length > 0) return first;
    if (typeof first === "number" && Number.isFinite(first)) return String(first);
  }
  return undefined;
}

/**
 * Read a query parameter when running behind Express: `req.query` is sometimes empty on the
 * object cast to VercelRequest, but `originalUrl` / `url` still contain ?lat=&lng=.
 */
export function getSearchParam(req: VercelRequest, name: string): string | undefined {
  const fromQuery = stringifyQueryValue(req.query?.[name]);
  if (fromQuery !== undefined) return fromQuery;

  const extended = req as unknown as { originalUrl?: string };
  const pathWithQuery =
    typeof extended.originalUrl === "string" && extended.originalUrl.length > 0
      ? extended.originalUrl
      : typeof req.url === "string"
        ? req.url
        : "";
  if (!pathWithQuery || !pathWithQuery.includes("?")) return undefined;
  try {
    const qi = pathWithQuery.indexOf("?");
    const q = new URLSearchParams(pathWithQuery.slice(qi + 1));
    return q.get(name) ?? undefined;
  } catch {
    return undefined;
  }
}
