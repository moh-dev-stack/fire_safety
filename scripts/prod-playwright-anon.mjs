/**
 * Playwright smoke test for the unauthenticated surface of prod.
 * No credentials required.
 *
 *   node scripts/prod-playwright-anon.mjs
 */
import { chromium } from "playwright";

const BASE = process.env.PROD_URL || "https://kek-fire-safety.vercel.app";
const passes = [];
const fails = [];

function pass(msg) {
  passes.push(msg);
  console.log("PASS:", msg);
}
function fail(msg) {
  fails.push(msg);
  console.error("FAIL:", msg);
}

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

const consoleErrors = [];
const failedRequests = [];
const pageErrors = [];

page.on("console", (msg) => {
  if (msg.type() === "error") {
    consoleErrors.push({ url: page.url(), text: msg.text() });
  }
});
page.on("pageerror", (err) => {
  pageErrors.push({ url: page.url(), message: err.message });
});
page.on("requestfailed", (req) => {
  const url = req.url();
  if (url.startsWith(BASE) || url.includes("kek-fire-safety")) {
    failedRequests.push({
      method: req.method(),
      url,
      error: req.failure()?.errorText,
    });
  }
});

// 1. Homepage should redirect to /login when logged out
console.log(`\n== 1. GET / when logged out`);
const homeResp = await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
if (homeResp && homeResp.ok()) pass(`GET / returns 2xx (${homeResp.status()})`);
else fail(`GET / status was ${homeResp?.status()}`);

await page.waitForURL(/\/login$|\/login\?/, { timeout: 10000 }).catch(() => {});
if (page.url().includes("/login")) pass("Redirected to /login when unauthenticated");
else fail(`Not redirected to login. Current URL: ${page.url()}`);

// 2. Login page renders required elements
console.log(`\n== 2. /login rendering`);
const userInput = page.locator('input[type="text"], input[name*="user" i]').first();
const passInput = page.locator('input[type="password"]').first();
const submitBtn = page.locator('button[type="submit"]').first();

if (await userInput.isVisible()) pass("Username input visible");
else fail("Username input missing");
if (await passInput.isVisible()) pass("Password input visible");
else fail("Password input missing");
if (await submitBtn.isVisible()) pass("Submit button visible");
else fail("Submit button missing");

// 3. Logo asset loads
console.log(`\n== 3. Static assets`);
const logo = page.locator('img[alt*="Fire" i], img[src*="logo"]').first();
if ((await logo.count()) > 0) {
  const naturalW = await logo.evaluate((el) => el.naturalWidth);
  if (naturalW > 0) pass(`Logo image loaded (naturalWidth=${naturalW})`);
  else fail("Logo <img> present but did not load (naturalWidth=0)");
} else {
  fail("No logo <img> found on login page");
}

// 4. Invalid login attempt shows error
console.log(`\n== 4. Invalid login`);
await userInput.fill("definitely-not-a-user-xyz");
await passInput.fill("wrong-password-xyz");

// Watch for the login POST
const loginRespP = page.waitForResponse(
  (r) => r.url().includes("/api/login") && r.request().method() === "POST",
  { timeout: 10000 },
);
await submitBtn.click();
try {
  const loginResp = await loginRespP;
  const status = loginResp.status();
  if (status === 401 || status === 403) pass(`Bad login returns ${status}`);
  else fail(`Bad login returned unexpected status: ${status}`);
} catch {
  fail("No /api/login POST fired within 10s of clicking submit");
}

// Should stay on login page
await page.waitForTimeout(500);
if (page.url().includes("/login")) pass("Stayed on /login after bad creds");
else fail(`Redirected away from /login after bad creds to ${page.url()}`);

// Error text should appear
const errorText = await page
  .locator('p:has-text("fail"), p:has-text("Invalid"), p:has-text("wrong"), [role="alert"]')
  .first()
  .textContent()
  .catch(() => null);
if (errorText && errorText.trim().length > 0) {
  pass(`Error message shown: "${errorText.trim().slice(0, 80)}"`);
} else {
  fail("No visible error text after failed login");
}

// 5. /api/me anonymously returns 401
console.log(`\n== 5. /api/me without cookie`);
const meResp = await page.request.get(`${BASE}/api/me`);
if (meResp.status() === 401) pass("/api/me returns 401 when anonymous");
else fail(`/api/me returned ${meResp.status()} instead of 401`);

// 6. /api/incidents anonymously returns 401
const incResp = await page.request.get(`${BASE}/api/incidents`);
if (incResp.status() === 401) pass("/api/incidents returns 401 when anonymous");
else fail(`/api/incidents returned ${incResp.status()} instead of 401`);

// 7. /api/tasks anonymously returns 401
const tasksResp = await page.request.get(`${BASE}/api/tasks`);
if (tasksResp.status() === 401) pass("/api/tasks returns 401 when anonymous");
else fail(`/api/tasks returned ${tasksResp.status()} instead of 401`);

// 8. Deep links redirect to /login
console.log(`\n== 6. Protected routes redirect to /login when unauthenticated`);
const routes = ["/team", "/team/tasks", "/map", "/incidents", "/venue-checklist"];
for (const path of routes) {
  await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(400);
  const url = page.url();
  if (url.includes("/login")) pass(`${path} -> /login when logged out`);
  else fail(`${path} did not redirect to /login (ended at ${url})`);
}

// 9. Client-side 404: unknown route should route to homepage/login (SPA fallback)
console.log(`\n== 7. Unknown route SPA fallback`);
await page.goto(`${BASE}/definitely-not-a-real-page-xyz`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(400);
if (page.url().includes("/login") || page.url().endsWith("/")) {
  pass("Unknown route falls back through SPA rewrite (ended at " + page.url() + ")");
} else {
  fail("Unknown route did not fall back to SPA (ended at " + page.url() + ")");
}

// 10. Report console + network summary
console.log(`\n===== Summary =====`);
console.log(`Passes: ${passes.length}`);
console.log(`Fails:  ${fails.length}`);
console.log(`\nConsole errors captured (${consoleErrors.length}):`);
for (const e of consoleErrors) console.log(`  ${e.url} :: ${e.text}`);
console.log(`\nUncaught page errors (${pageErrors.length}):`);
for (const e of pageErrors) console.log(`  ${e.url} :: ${e.message}`);
console.log(`\nFailed requests (${failedRequests.length}):`);
for (const r of failedRequests) console.log(`  ${r.method} ${r.url} :: ${r.error}`);

await browser.close();

if (fails.length > 0 || pageErrors.length > 0) {
  process.exit(1);
}
console.log("\nAll anonymous smoke checks passed.");
