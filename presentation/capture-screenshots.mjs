/**
 * Capture deck screenshots against a running dev server.
 * Usage from repo root:
 *   npx --yes -p playwright@1.50.1 node presentation/capture-screenshots.mjs
 * Env: BASE_URL (default http://127.0.0.1:5173), LOGIN_PASSWORD (default 1234)
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "screenshots");
const base = process.env.BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:5173";
const password = process.env.LOGIN_PASSWORD ?? "1234";

const authenticatedShots = [
  { path: "/", file: "02-team.png" },
  { path: "/rota", file: "03-rota.png" },
  { path: "/incidents", file: "04-report.png" },
  { path: "/incidents/log", file: "05-log.png" },
  { path: "/map", file: "06-map.png" },
  { path: "/team/roles", file: "08-roles.png" },
];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function login(page) {
  await page.goto(`${base}/login`, { waitUntil: "networkidle" });
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(
    (url) => !url.pathname.endsWith("/login"),
    { timeout: 15_000 },
  );
}

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();

await page.goto(`${base}/login`, { waitUntil: "networkidle" });
await delay(300);
await page.screenshot({ path: join(outDir, "01-login.png"), fullPage: true });
console.log("wrote 01-login.png");

await login(page);

for (const { path: p, file } of authenticatedShots) {
  await page.goto(`${base}${p}`, { waitUntil: "networkidle" });
  await delay(500);
  await page.screenshot({ path: join(outDir, file), fullPage: true });
  console.log("wrote", file);
}

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${base}/`, { waitUntil: "networkidle" });
await delay(400);
await page.screenshot({
  path: join(outDir, "09-shell-mobile.png"),
  fullPage: true,
});
console.log("wrote 09-shell-mobile.png");

await browser.close();
