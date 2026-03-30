/**
 * Serves /api/* on port 3000 for local development without `vercel dev`.
 * Loads `.env.local` first. Use with Vite (proxy) via `npm run dev:all`.
 */
import { config } from "dotenv";
import express, { type Request, type Response } from "express";
import { resolve } from "node:path";
import type { VercelRequest, VercelResponse } from "@vercel/node";

config({ path: resolve(process.cwd(), ".env.local") });
if (!process.env.NODE_ENV) process.env.NODE_ENV = "development";

const vReq = (req: Request) => req as unknown as VercelRequest;
const vRes = (res: Response) => res as unknown as VercelResponse;

const app = express();
app.use(express.json({ limit: "1mb" }));

app.post("/api/login", (req, res) => {
  void import("../api/login.ts").then((m) => m.default(vReq(req), vRes(res)));
});
app.post("/api/logout", (req, res) => {
  void import("../api/logout.ts").then((m) => m.default(vReq(req), vRes(res)));
});
app.get("/api/me", (req, res) => {
  void import("../api/me.ts").then((m) => m.default(vReq(req), vRes(res)));
});

app.get("/api/incidents/export", (req, res) => {
  void import("../api/incidents/export.ts").then((m) =>
    m.default(vReq(req), vRes(res)),
  );
});
app.get("/api/incidents/draft", (req, res) => {
  void import("../api/incidents/draft.ts").then((m) =>
    m.default(vReq(req), vRes(res)),
  );
});
app.put("/api/incidents/draft", (req, res) => {
  void import("../api/incidents/draft.ts").then((m) =>
    m.default(vReq(req), vRes(res)),
  );
});
app.delete("/api/incidents/draft", (req, res) => {
  void import("../api/incidents/draft.ts").then((m) =>
    m.default(vReq(req), vRes(res)),
  );
});
app.get("/api/incidents", (req, res) => {
  void import("../api/incidents.ts").then((m) =>
    m.default(vReq(req), vRes(res)),
  );
});
app.post("/api/incidents", (req, res) => {
  void import("../api/incidents.ts").then((m) =>
    m.default(vReq(req), vRes(res)),
  );
});

app.get("/api/cron/snapshot-incidents", (req, res) => {
  void import("../api/cron/snapshot-incidents.ts").then((m) =>
    m.default(vReq(req), vRes(res)),
  );
});
app.post("/api/cron/snapshot-incidents", (req, res) => {
  void import("../api/cron/snapshot-incidents.ts").then((m) =>
    m.default(vReq(req), vRes(res)),
  );
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, "127.0.0.1", () => {
  console.log(`Local API http://127.0.0.1:${port} (loaded .env.local if present)`);
});
