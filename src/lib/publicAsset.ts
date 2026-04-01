/**
 * Prefix paths to files in `public/` when the app is served under a non-root `base` in Vite.
 */
export function publicAsset(pathFromPublicRoot: string): string {
  const path = pathFromPublicRoot.startsWith("/")
    ? pathFromPublicRoot
    : `/${pathFromPublicRoot}`;
  const base = import.meta.env.BASE_URL;
  if (base === "/") return path;
  const trimmed = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${trimmed}${path}`;
}
