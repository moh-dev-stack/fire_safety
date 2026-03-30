import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isAuthenticated } from "./lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  if (!(await isAuthenticated(req))) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  res.status(200).json({ ok: true });
}
