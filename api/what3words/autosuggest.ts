import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isAuthenticated } from "../lib/auth.js";
import { getSearchParam } from "../lib/request-query.js";
import { getW3wApiKey } from "../lib/w3w-env.js";

type W3wAutosuggestItem = {
  country?: string;
  nearestPlace?: string;
  words?: string;
  rank?: number;
  language?: string;
};

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

  const rawInput = getSearchParam(req, "input");
  const input = rawInput ? rawInput.trim() : "";
  if (input.length < 2) {
    res.status(200).json({ suggestions: [] as { words: string; nearestPlace: string }[] });
    return;
  }

  const url = new URL("https://api.what3words.com/v3/autosuggest");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("input", input);
  url.searchParams.set("n-results", "8");

  try {
    const w3wRes = await fetch(url.toString());
    const data = (await w3wRes.json()) as {
      suggestions?: W3wAutosuggestItem[];
      error?: { code?: string; message?: string };
    };

    if (!w3wRes.ok) {
      console.error("w3w autosuggest failed", w3wRes.status, data);
      res.status(502).json({ error: "what3words request failed" });
      return;
    }

    const suggestions = (data.suggestions ?? [])
      .filter((s): s is W3wAutosuggestItem & { words: string } => Boolean(s.words))
      .map((s) => ({
        words: s.words,
        nearestPlace: s.nearestPlace ?? "",
      }));

    res.status(200).json({ suggestions });
  } catch (e) {
    console.error(e);
    res.status(502).json({ error: "what3words request failed" });
  }
}
