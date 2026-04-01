/**
 * API smoke tests against a running local API (default http://127.0.0.1:3000).
 * Loads .env.local for SESSION_SECRET checks; start API with: npm run dev:api
 *
 * Usage: npm run smoke
 */
import { config } from "dotenv";
import { resolve } from "node:path";
import process from "node:process";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local"), override: true });

const API = process.env.SMOKE_API_URL ?? "http://127.0.0.1:3000";
const PASSWORD = "1234";

function fail(msg) {
  console.error(`\x1b[31mFAIL\x1b[0m ${msg}`);
  process.exitCode = 1;
}

function pass(msg) {
  console.log(`\x1b[32mOK\x1b[0m   ${msg}`);
}

function warn(msg) {
  console.log(`\x1b[33mWARN\x1b[0m ${msg}`);
}

function cookieHeaderFromResponse(res) {
  const setCookie =
    typeof res.headers.getSetCookie === "function"
      ? res.headers.getSetCookie()
      : null;
  const list = setCookie?.length
    ? setCookie
    : (() => {
        const single = res.headers.get("set-cookie");
        return single ? [single] : [];
      })();
  const raw = list.find((c) => c.startsWith("jalsa_session="));
  if (!raw) return "";
  return raw.split(";")[0];
}

async function login(username) {
  const res = await fetch(`${API}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password: PASSWORD }),
  });
  const cookie = cookieHeaderFromResponse(res);
  return { res, cookie };
}

async function main() {
  console.log(`Smoke API base: ${API}\n`);

  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 16) {
    warn("SESSION_SECRET missing or short — login will fail. Set in .env.local.");
  }

  // Health: TCP
  let reachable = false;
  try {
    const ping = await fetch(`${API}/api/me`, { method: "GET" });
    reachable = true;
    if (ping.status !== 401) {
      warn(`/api/me without cookie: expected 401, got ${ping.status}`);
    } else {
      pass("GET /api/me without cookie → 401");
    }
  } catch (e) {
    fail(`API not reachable at ${API} — start: npm run dev:api (${e.message})`);
    process.exit(1);
  }

  if (!reachable) return;

  const bad = await fetch(`${API}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "admin", password: "wrong" }),
  });
  if (bad.status !== 401) {
    fail(`Invalid password should 401, got ${bad.status}`);
  } else {
    pass("POST /api/login invalid password → 401");
  }

  const unknownUser = await fetch(`${API}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "root", password: PASSWORD }),
  });
  if (unknownUser.status !== 401) {
    fail(`Unknown username should 401, got ${unknownUser.status}`);
  } else {
    pass("POST /api/login unknown username → 401");
  }

  const adminLogin = await login("admin");
  if (!adminLogin.res.ok || !adminLogin.cookie) {
    fail(`Admin login failed: ${adminLogin.res.status}`);
  } else {
    pass("POST /api/login admin → session cookie");
  }

  const adminMe = await fetch(`${API}/api/me`, {
    headers: { Cookie: adminLogin.cookie },
  });
  const adminMeJson = await adminMe.json().catch(() => ({}));
  if (!adminMe.ok || adminMeJson.role !== "admin") {
    fail(`GET /api/me as admin: ${adminMe.status} ${JSON.stringify(adminMeJson)}`);
  } else {
    pass("GET /api/me as admin → role admin");
  }

  const userLogin = await login("user");
  if (!userLogin.res.ok || !userLogin.cookie) {
    fail(`User login failed: ${userLogin.res.status}`);
  } else {
    pass("POST /api/login user → session cookie");
  }

  const userMe = await fetch(`${API}/api/me`, {
    headers: { Cookie: userLogin.cookie },
  });
  const userMeJson = await userMe.json().catch(() => ({}));
  if (!userMe.ok || userMeJson.role !== "user") {
    fail(`GET /api/me as user: ${userMe.status} ${JSON.stringify(userMeJson)}`);
  } else {
    pass("GET /api/me as user → role user");
  }

  const userList = await fetch(`${API}/api/incidents`, {
    headers: { Cookie: userLogin.cookie },
  });
  if (userList.status !== 403) {
    fail(`GET /api/incidents as user should 403, got ${userList.status}`);
  } else {
    pass("GET /api/incidents as user → 403");
  }

  const userExport = await fetch(`${API}/api/incidents/export`, {
    headers: { Cookie: userLogin.cookie },
  });
  if (userExport.status !== 403) {
    fail(`GET /api/incidents/export as user should 403, got ${userExport.status}`);
  } else {
    pass("GET /api/incidents/export as user → 403");
  }

  const adminList = await fetch(`${API}/api/incidents`, {
    headers: { Cookie: adminLogin.cookie },
  });
  if (adminList.status === 200) {
    pass("GET /api/incidents as admin → 200");
  } else if (adminList.status === 500) {
    const j = await adminList.json().catch(() => ({}));
    warn(
      `GET /api/incidents as admin → 500 (configure DATABASE_URL / POSTGRES_URL and run db:apply): ${j.error ?? ""}`,
    );
  } else {
    fail(`GET /api/incidents as admin: unexpected ${adminList.status}`);
  }

  const adminExport = await fetch(`${API}/api/incidents/export`, {
    headers: { Cookie: adminLogin.cookie },
  });
  if (adminExport.status === 200) {
    pass("GET /api/incidents/export as admin → 200");
  } else if (adminExport.status === 500) {
    warn("GET /api/incidents/export as admin → 500 (DB or query issue)");
  } else {
    fail(`GET /api/incidents/export as admin: unexpected ${adminExport.status}`);
  }

  const draftUser = await fetch(`${API}/api/incidents/draft`, {
    headers: { Cookie: userLogin.cookie },
  });
  if (draftUser.status !== 200) {
    fail(`GET /api/incidents/draft as user: ${draftUser.status}`);
  } else {
    pass("GET /api/incidents/draft as user → 200");
  }

  const w3w = await fetch(`${API}/api/what3words/autosuggest?input=test`, {
    headers: { Cookie: adminLogin.cookie },
  });
  if (w3w.status === 503) {
    warn("what3words autosuggest → 503 (W3W_API_KEY not set — optional)");
  } else if (w3w.status === 200) {
    pass("GET /api/what3words/autosuggest → 200");
  } else {
    warn(`GET /api/what3words/autosuggest → ${w3w.status}`);
  }

  const logoutRes = await fetch(`${API}/api/logout`, {
    method: "POST",
    headers: { Cookie: adminLogin.cookie },
  });
  if (!logoutRes.ok) {
    fail(`POST /api/logout: ${logoutRes.status}`);
  } else {
    pass("POST /api/logout → ok");
  }

  // Logout clears the cookie in browsers; JWT is not server-revoked — same token in `Cookie:` would still work.
  const afterLogoutNoCookie = await fetch(`${API}/api/me`);
  if (afterLogoutNoCookie.status === 401) {
    pass("GET /api/me with no cookie after logout flow → 401");
  } else {
    fail(`GET /api/me without cookie: expected 401, got ${afterLogoutNoCookie.status}`);
  }

  if (process.exitCode) {
    console.error("\nSmoke finished with failures.");
    process.exit(1);
  }
  console.log("\nSmoke finished successfully.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
