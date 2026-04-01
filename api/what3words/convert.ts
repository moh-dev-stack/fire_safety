import type { VercelRequest, VercelResponse } from "@vercel/node";
import { normalizeIncidentW3w } from "../../src/model/incident.js";
import { isAuthenticated } from "../lib/auth.js";
import { getSearchParam } from "../lib/request-query.js";
import { getW3wApiKey } from "../lib/w3w-env.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!(await isAuthenticated(req))) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = getW3wApiKey();
  if (!apiKey) {
    res.status(503).json({ error: "what3words lookup is not configured" });
    return;
  }

  const rawWords = getSearchParam(req, "words");
  const wordsArg = rawWords ? normalizeIncidentW3w(rawWords) : "";
  if (!wordsArg) {
    res.status(400).json({ error: "Missing or empty words" });
    return;
  }

  const url = new URL("https://api.what3words.com/v3/convert-to-coordinates");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("words", wordsArg);
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  try {
    const w3wRes = await fetch(url.toString());
    const rawText = await w3wRes.text();
    let data: {
      words?: string;
      nearestPlace?: string;
      country?: string;
      error?: { code?: string; message?: string };
    };
    try {
      data = rawText ? (JSON.parse(rawText) as typeof data) : {};
    } catch {
      console.error("w3w convert-to-coordinates non-JSON", w3wRes.status, rawText.slice(0, 200));
      res.status(502).json({ error: "what3words returned invalid JSON" });
      return;
    }

    if (!w3wRes.ok) {
      const msg = data.error?.message ?? "Invalid what3words address";
      res.status(400).json({ error: msg });
      return;
    }

    if (!data.words) {
      console.error("w3w convert-to-coordinates missing words", w3wRes.status, rawText.slice(0, 300));
      res.status(502).json({ error: "Unexpected what3words response (no words)" });
      return;
    }

    res.status(200).json({
      words: data.words,
      nearestPlace: data.nearestPlace ?? "",
      country: data.country ?? "",
    });
  } catch (e) {
    console.error(e);
    res.status(502).json({ error: "what3words request failed" });
  }
}
