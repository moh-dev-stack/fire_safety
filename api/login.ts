import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  createSessionToken,
  setSessionCookie,
  type SessionRole,
} from "../server/lib/session.js";

/** Fixed POC gate - not overridable via env; only this value is accepted. */
const LOGIN_PASSWORD = "1234";

function roleFromUsername(raw: string): SessionRole | null {
  const u = raw.trim();
  if (u === "admin") return "admin";
  if (u === "user") return "user";
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const username = String(body?.username ?? "");
    const password = String(body?.password ?? "").trim();
    const role = roleFromUsername(username);

    if (!role || password !== LOGIN_PASSWORD) {
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }

    const token = await createSessionToken(role);
    setSessionCookie(res, token);
    res.status(200).json({ ok: true, role });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid request";
    if (msg.includes("SESSION_SECRET")) {
      res.status(500).json({
        error:
          "Server misconfigured: set SESSION_SECRET (min 16 random characters). Locally: .env.local. On Vercel: Project → Settings → Environment Variables, then redeploy.",
      });
      return;
    }
    res.status(400).json({ error: "Invalid request" });
  }
}
