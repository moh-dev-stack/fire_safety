/**
 * Playwright smoke test against production.
 * Requires AUTH_USERNAME + AUTH_PASSWORD in the shell env.
 *
 *   AUTH_USERNAME=... AUTH_PASSWORD=... node scripts/prod-playwright-tasks.mjs
 */
import { chromium } from "playwright";

const BASE = process.env.PROD_URL || "https://kek-fire-safety.vercel.app";
const USERNAME = process.env.AUTH_USERNAME;
const PASSWORD = process.env.AUTH_PASSWORD;

if (!USERNAME || !PASSWORD) {
  console.error("Missing AUTH_USERNAME or AUTH_PASSWORD in env.");
  process.exit(2);
}

const log = (...args) => console.log("[prod]", ...args);
const fail = (msg) => {
  console.error("FAIL:", msg);
  process.exitCode = 1;
};

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

const consoleMessages = [];
const failedRequests = [];
const apiCalls = [];

page.on("console", (msg) => {
  const line = `[${msg.type()}] ${msg.text()}`;
  consoleMessages.push(line);
  if (msg.type() === "error" || msg.type() === "warning") log("CONSOLE", line);
});
page.on("pageerror", (err) => {
  consoleMessages.push(`[pageerror] ${err.message}`);
  log("PAGEERROR", err.message);
});
page.on("requestfailed", (req) => {
  const info = `${req.method()} ${req.url()} :: ${req.failure()?.errorText}`;
  failedRequests.push(info);
  log("REQFAIL", info);
});
page.on("response", async (res) => {
  const url = res.url();
  if (url.includes("/api/tasks")) {
    let body = "";
    try {
      body = (await res.text()).slice(0, 500);
    } catch {}
    apiCalls.push({
      method: res.request().method(),
      url,
      status: res.status(),
      body,
    });
    log("API", res.request().method(), url, "->", res.status());
  }
});

log("Going to", BASE);
await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });

log("Filling login form");
await page.fill('input[name="username"], input[type="text"]', USERNAME);
await page.fill('input[name="password"], input[type="password"]', PASSWORD);
await page.click('button[type="submit"], button:has-text("Log")');

log("Waiting for auth redirect");
try {
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 15000,
  });
} catch {
  fail("Login redirect never happened. Current URL: " + page.url());
  await page.screenshot({ path: "/tmp/prod-login-failed.png" });
  await browser.close();
  process.exit(1);
}
log("Signed in, at", page.url());

log("Navigating to /team/tasks");
await page.goto(`${BASE}/team/tasks`, { waitUntil: "networkidle" });
await page.screenshot({ path: "/tmp/prod-tasks-page.png", fullPage: true });

// Are we actually on Tasks?
const heading = await page.locator("h1").first().textContent();
log("Heading text:", JSON.stringify(heading));
if (heading?.trim() !== "Tasks") {
  fail(`Not on Tasks page, heading was ${JSON.stringify(heading)}`);
}

// Create a smoke test task via the New task form so we know one exists.
log("Clicking 'New task'");
await page.click('button:has-text("New task")');
const taskLabel = `PLAYWRIGHT SMOKE ${new Date().toISOString()}`;
await page.fill('input[id="task-input"]', taskLabel);
await page.click('button:has-text("Save task")');

log("Waiting for new task card to appear");
try {
  await page.waitForSelector(`text=${taskLabel}`, { timeout: 10000 });
  log("Task card visible");
} catch {
  fail("New task did not appear within 10s");
}

// Locate the status <select> next to that task
const card = page.locator("li", { hasText: taskLabel }).first();
const select = card.locator("select");

log("Reading current status");
const before = await select.inputValue();
log("Before:", before);

log("Trying to change status to in_progress");
apiCalls.length = 0;
await select.selectOption("in_progress");
try {
  await page.waitForResponse(
    (r) =>
      r.url().includes("/api/tasks/") &&
      r.request().method() === "PATCH",
    { timeout: 10000 },
  );
} catch {
  fail("No PATCH request made when changing status. Select may be silently no-op.");
}

// Give React a moment to re-render
await page.waitForTimeout(500);

const after = await select.inputValue();
log("After:", after);
if (after !== "in_progress") {
  fail(`Status did not update in UI. Expected in_progress, got ${after}.`);
} else {
  log("PASS status changed to in_progress in UI");
}

// Now go straight to completed
log("Trying to change status to completed");
await select.selectOption("completed");
try {
  await page.waitForResponse(
    (r) =>
      r.url().includes("/api/tasks/") &&
      r.request().method() === "PATCH",
    { timeout: 10000 },
  );
} catch {
  fail("No PATCH request made when changing status to completed.");
}
await page.waitForTimeout(500);

// After completion, on the "Open" filter the row should disappear.
// Switch to "All" filter first so we can find the row.
log("Switching to All filter");
await page.click('button:has-text("All")');
await page.waitForTimeout(300);

const cardAfter = page.locator("li", { hasText: taskLabel }).first();
const selectAfter = cardAfter.locator("select");
const afterCompleted = await selectAfter.inputValue();
log("After completed:", afterCompleted);
if (afterCompleted !== "completed") {
  fail(`Status did not update to completed. Got ${afterCompleted}.`);
} else {
  log("PASS status changed to completed in UI");
}

// Delete button should now be visible
const deleteBtn = cardAfter.locator('button:has-text("Delete")');
const deleteVisible = await deleteBtn.isVisible();
log("Delete button visible after completed:", deleteVisible);
if (!deleteVisible) {
  fail("Delete button not visible even though task is Completed");
}

// Handle browser confirm() dialog
page.on("dialog", (d) => d.accept());

log("Clicking Delete");
if (deleteVisible) {
  await deleteBtn.click();
  try {
    await page.waitForResponse(
      (r) =>
        r.url().includes("/api/tasks/") && r.request().method() === "DELETE",
      { timeout: 10000 },
    );
  } catch {
    fail("No DELETE request fired");
  }
  await page.waitForTimeout(500);
  const gone = (await page.locator("li", { hasText: taskLabel }).count()) === 0;
  log("Row removed from list after delete:", gone);
  if (!gone) fail("Task row still present after delete");
}

console.log("\n===== Summary =====");
console.log(`Console messages (${consoleMessages.length}):`);
for (const m of consoleMessages) console.log("  ", m);
console.log(`\nFailed requests (${failedRequests.length}):`);
for (const r of failedRequests) console.log("  ", r);
console.log(`\nRecent /api/tasks calls (${apiCalls.length}):`);
for (const c of apiCalls) {
  console.log(`   ${c.method} ${c.url} -> ${c.status}`);
  if (c.status >= 400) console.log(`     body: ${c.body}`);
}

await browser.close();

if (process.exitCode) {
  console.error("\nSmoke test FAILED. See failures above.");
  process.exit(process.exitCode);
}
console.log("\nProd smoke test PASSED.");
