import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { SessionRole } from "../src/model/sessionRole.js";
import {
  createSessionToken,
  setSessionCookie,
} from "../server/lib/session.js";

type Credential = { role: SessionRole; password: string };

const USERS: Record<string, Credential> = {
  admin: { role: "admin", password: "1234" },
  user: { role: "user", password: "1234" },
  "firesafety.jalsa@khuddam.co.uk": { role: "admin", password: "Fire3afety2026!" },
};

function resolveCredential(rawUsername: string): Credential | null {
  return USERS[rawUsername.trim().toLowerCase()] ?? null;
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
    const cred = resolveCredential(username);

    if (!cred || password !== cred.password) {
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }

    const token = await createSessionToken(cred.role);
    setSessionCookie(res, token);
    res.status(200).json({ ok: true, role: cred.role });
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
