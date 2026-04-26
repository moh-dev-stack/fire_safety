/**
 * Loads .env.local (simple KEY=VAL parser) and runs sql/schema.sql via Neon.
 * Usage: npm run db:apply
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnvLocal() {
  const path = join(root, ".env.local");
  const text = readFileSync(path, "utf8");
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

loadEnvLocal();

/** Same resolution as server/lib/neon.ts so migrations hit the DB the app uses. */
function resolveDatabaseUrl() {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL_NON_POOLING,
  ];
  for (const u of candidates) {
    if (typeof u === "string" && u.trim().length > 0) return u.trim();
  }
  return null;
}

const url = resolveDatabaseUrl();
if (!url) {
  console.error(
    "No Postgres URL in .env.local. Set DATABASE_URL (recommended) or POSTGRES_URL / POSTGRES_PRISMA_URL.",
  );
  process.exit(1);
}

const sql = neon(url);
const schemaPath = join(root, "sql", "schema.sql");
const schema = readFileSync(schemaPath, "utf8");
const statements = schema
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

for (const stmt of statements) {
  await sql.query(stmt);
  console.log("OK:", stmt.split("\n")[0].slice(0, 60) + "…");
}

console.log("Schema applied successfully.");
