import type { VercelRequest, VercelResponse } from "@vercel/node";
import { normalizeIncidentW3w } from "../../src/model/incident.js";
import { isAuthenticated } from "../lib/auth.js";
import { getSearchParam } from "../lib/request-query.js";
import { getW3wApiKey } from "../lib/w3w-env.js";

function parseCoord(v: string | undefined): number | null {
  if (v === undefined || v === "") return null;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

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

  const lat = parseCoord(getSearchParam(req, "lat"));
  const lng = parseCoord(getSearchParam(req, "lng"));
  if (lat === null || lng === null) {
    res.status(400).json({ error: "Missing or invalid lat / lng" });
    return;
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    res.status(400).json({ error: "Coordinates out of range" });
    return;
  }

  const url = new URL("https://api.what3words.com/v3/convert-to-3wa");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("coordinates", `${lat},${lng}`);
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
      console.error("w3w convert-to-3wa non-JSON", w3wRes.status, rawText.slice(0, 200));
      res.status(502).json({ error: "what3words returned invalid JSON" });
      return;
    }

    if (!w3wRes.ok) {
      const msg = data.error?.message ?? "Could not resolve coordinates";
      res.status(400).json({ error: msg });
      return;
    }

    const wordsNorm =
      typeof data.words === "string" && data.words.length > 0
        ? normalizeIncidentW3w(data.words)
        : "";
    if (!wordsNorm) {
      console.error("w3w convert-to-3wa missing words", w3wRes.status, rawText.slice(0, 300));
      res.status(502).json({ error: "Unexpected what3words response (no words)" });
      return;
    }

    res.status(200).json({
      words: wordsNorm,
      nearestPlace: typeof data.nearestPlace === "string" ? data.nearestPlace : "",
      country: typeof data.country === "string" ? data.country : "",
    });
  } catch (e) {
    console.error(e);
    res.status(502).json({ error: "what3words request failed" });
  }
}
