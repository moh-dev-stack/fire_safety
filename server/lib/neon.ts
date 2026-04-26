import { neon } from "@neondatabase/serverless";

let sql: ReturnType<typeof neon> | null = null;

/**
 * Picks the first Postgres URL present. Vercel + Neon often inject
 * `POSTGRES_URL` / `POSTGRES_PRISMA_URL` without defining `DATABASE_URL`.
 */
function resolveDatabaseUrl(): string {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL_NON_POOLING,
  ];
  for (const url of candidates) {
    if (typeof url === "string" && url.trim().length > 0) {
      return url.trim();
    }
  }
  throw new Error(
    "No Postgres URL in environment. Set DATABASE_URL (recommended) or POSTGRES_URL / POSTGRES_PRISMA_URL from your Neon ↔ Vercel integration.",
  );
}

export function getSql() {
  if (!sql) {
    sql = neon(resolveDatabaseUrl());
  }
  return sql;
}
