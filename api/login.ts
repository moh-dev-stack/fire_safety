import type { VercelRequest, VercelResponse } from "@vercel/node";
import { expectedLoginPassword } from "./lib/expected-login-password";
import { createSessionToken, setSessionCookie } from "./lib/session";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const password = String(body?.password ?? "").trim();

    if (password !== expectedLoginPassword()) {
      res.status(401).json({ error: "Invalid password" });
      return;
    }

    const token = await createSessionToken();
    setSessionCookie(res, token);
    res.status(200).json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid request";
    if (msg.includes("SESSION_SECRET")) {
      res.status(500).json({
        error:
          "Server misconfigured: set SESSION_SECRET (16+ chars) in .env.local. See .env.example.",
      });
      return;
    }
    res.status(400).json({ error: "Invalid request" });
  }
}
