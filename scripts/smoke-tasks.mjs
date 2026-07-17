import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SignJWT } from "jose";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const text = readFileSync(join(root, ".env.local"), "utf8");
for (const line of text.split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i === -1) continue;
  const k = t.slice(0, i).trim();
  let v = t.slice(i + 1).trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  process.env[k] = v;
}

const SECRET = process.env.SESSION_SECRET;
if (!SECRET) throw new Error("SESSION_SECRET missing");
const BASE = "http://127.0.0.1:3000";

const token = await new SignJWT({ auth: "jalsa-fire-safety", role: "admin" })
  .setProtectedHeader({ alg: "HS256" })
  .setIssuedAt()
  .setExpirationTime("1h")
  .sign(new TextEncoder().encode(SECRET));

const cookie = `jalsa_session=${encodeURIComponent(token)}`;
const H = { "Content-Type": "application/json", cookie };

function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exit(1);
  }
  console.log("PASS:", msg);
}

// 1) create
const createRes = await fetch(`${BASE}/api/tasks`, {
  method: "POST",
  headers: H,
  body: JSON.stringify({
    task: "SMOKE TEST - safe to delete",
    deadline: "2026-08-01",
    allocation: "smoke-bot",
    status: "pending",
    notes: [],
  }),
});
assert(createRes.status === 201, `POST /api/tasks returns 201 (got ${createRes.status})`);
const created = await createRes.json();
assert(created.id > 0, `created has id (${created.id})`);
assert(created.status === "pending", `created.status === pending`);
assert(created.deadline === "2026-08-01", `created.deadline persisted`);
assert(created.allocation === "smoke-bot", `created.allocation persisted`);

// 2) list
const listRes = await fetch(`${BASE}/api/tasks`, { headers: H });
assert(listRes.status === 200, `GET /api/tasks returns 200`);
const list = await listRes.json();
assert(Array.isArray(list), `list is array`);
assert(list.some((r) => r.id === created.id), `created row appears in list`);

// 3) status dropdown flow: pending -> in_progress
const patchRes1 = await fetch(`${BASE}/api/tasks/${created.id}`, {
  method: "PATCH",
  headers: H,
  body: JSON.stringify({ status: "in_progress" }),
});
assert(patchRes1.status === 200, `PATCH status->in_progress returns 200`);
const p1 = await patchRes1.json();
assert(p1.status === "in_progress", `status changed to in_progress`);

// 4) pending -> in_progress -> completed
const patchRes2 = await fetch(`${BASE}/api/tasks/${created.id}`, {
  method: "PATCH",
  headers: H,
  body: JSON.stringify({ status: "completed" }),
});
assert(patchRes2.status === 200, `PATCH status->completed returns 200`);
const p2 = await patchRes2.json();
assert(p2.status === "completed", `status changed to completed`);

// 5) invalid status is rejected
const badRes = await fetch(`${BASE}/api/tasks/${created.id}`, {
  method: "PATCH",
  headers: H,
  body: JSON.stringify({ status: "bogus" }),
});
assert(badRes.status === 400, `invalid status rejected (${badRes.status})`);

// 6) append note
const noteRes = await fetch(`${BASE}/api/tasks/${created.id}`, {
  method: "PATCH",
  headers: H,
  body: JSON.stringify({ appendNote: { author: "SB", body: "First note from smoke test" } }),
});
assert(noteRes.status === 200, `PATCH appendNote returns 200`);
const p3 = await noteRes.json();
assert(p3.notes.length === 1, `notes array has 1 entry`);
assert(p3.notes[0].author === "SB", `note author persisted`);
assert(p3.notes[0].body === "First note from smoke test", `note body persisted`);
assert(typeof p3.notes[0].at === "string" && p3.notes[0].at.length > 0, `note has timestamp`);

// 7) append second note preserves first
const note2Res = await fetch(`${BASE}/api/tasks/${created.id}`, {
  method: "PATCH",
  headers: H,
  body: JSON.stringify({ appendNote: { author: "MR", body: "Second note" } }),
});
const p4 = await note2Res.json();
assert(p4.notes.length === 2, `notes append preserved first note (${p4.notes.length})`);

// 8) unauthorised without cookie
const noAuth = await fetch(`${BASE}/api/tasks`, {
  method: "GET",
  headers: { "Content-Type": "application/json" },
});
assert(noAuth.status === 401, `GET without cookie returns 401 (${noAuth.status})`);

// 9) delete (cleanup)
const delRes = await fetch(`${BASE}/api/tasks/${created.id}`, {
  method: "DELETE",
  headers: H,
});
assert(delRes.status === 204, `DELETE returns 204 (${delRes.status})`);

// 10) verify gone
const afterDel = await fetch(`${BASE}/api/tasks`, { headers: H });
const list2 = await afterDel.json();
assert(!list2.some((r) => r.id === created.id), `deleted row no longer in list`);

console.log("\nAll smoke tests passed.");
