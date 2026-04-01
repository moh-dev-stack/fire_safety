/** Server-only what3words key — supports common env names and strips wrapping quotes. */
export function getW3wApiKey(): string {
  const raw =
    process.env.W3W_API_KEY?.trim() ||
    process.env.WHAT3WORDS_API_KEY?.trim() ||
    process.env.W3_API_KEY?.trim() ||
    "";
  if (!raw) return "";
  return raw.replace(/^['"]|['"]$/g, "");
}
