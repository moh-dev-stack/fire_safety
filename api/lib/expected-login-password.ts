/** Used when `AUTH_PASSWORD` is unset, null, or blank after trim. */
export const DEFAULT_LOGIN_PASSWORD = "1234";

/**
 * Resolved password the server expects. No `AUTH_PASSWORD` (or empty / whitespace
 * only) → always defaults to {@link DEFAULT_LOGIN_PASSWORD}.
 */
export function expectedLoginPassword(
  env: Record<string, string | undefined> = process.env,
): string {
  const v = env.AUTH_PASSWORD;
  if (v == null) return DEFAULT_LOGIN_PASSWORD;
  const t = String(v).trim();
  return t.length > 0 ? t : DEFAULT_LOGIN_PASSWORD;
}
