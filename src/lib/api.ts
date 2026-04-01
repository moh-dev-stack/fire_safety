import { upload } from "@vercel/blob/client";
import {
  INCIDENT_IMAGE_URL_MAX,
  type IncidentCreate,
  type IncidentDraft,
} from "../model/incident";
import type { SessionRole } from "../model/sessionRole";

export type FetchIncidentDraftResult = {
  draft: IncidentDraft | null;
  updated_at?: string;
};

export class ValidationFailedError extends Error {
  readonly details: {
    formErrors: string[];
    fieldErrors: Record<string, string[] | undefined>;
  };

  constructor(
    details: ValidationFailedError["details"],
    message = "Validation failed",
  ) {
    super(message);
    this.name = "ValidationFailedError";
    this.details = details;
  }
}

async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  return res;
}

export async function login(username: string, password: string) {
  let res: Response;
  try {
    res = await apiFetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  } catch {
    throw new Error(
      "Cannot reach the server. Run `npm run dev` (API on :3000 + Vite on :5173 with /api proxy), then open http://localhost:5173/",
    );
  }
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(j.error ?? "Login failed");
  }
}

export async function logout() {
  await apiFetch("/api/logout", { method: "POST" });
}

export type MeResult =
  | { ok: true; role: SessionRole }
  | { ok: false; role?: undefined };

export async function me(): Promise<MeResult> {
  const res = await apiFetch("/api/me");
  if (!res.ok) return { ok: false };
  const j = (await res.json().catch(() => ({}))) as {
    ok?: unknown;
    role?: SessionRole;
  };
  if (j.role === "admin" || j.role === "user") {
    return { ok: true, role: j.role };
  }
  return { ok: false };
}

export async function fetchIncidents() {
  const res = await apiFetch("/api/incidents");
  if (!res.ok) throw new Error("Failed to load incidents");
  return res.json();
}

export async function fetchIncidentDraft(): Promise<FetchIncidentDraftResult> {
  const res = await apiFetch("/api/incidents/draft");
  if (!res.ok) throw new Error("Failed to load draft");
  return res.json() as Promise<FetchIncidentDraftResult>;
}

export async function saveIncidentDraft(draft: IncidentDraft): Promise<void> {
  const res = await apiFetch("/api/incidents/draft", {
    method: "PUT",
    body: JSON.stringify(draft),
  });
  if (!res.ok) throw new Error("Failed to save draft");
}

export async function clearIncidentDraft(): Promise<void> {
  const res = await apiFetch("/api/incidents/draft", { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to clear draft");
}

function safeImageFilename(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
  return base.length > 0 ? base : "photo";
}

/**
 * Upload image files to Vercel Blob (client-side upload with session cookie).
 * Returns public HTTPS URLs in order. Requires `BLOB_READ_WRITE_TOKEN` on the server.
 */
export async function uploadIncidentImages(files: File[]): Promise<string[]> {
  if (files.length > INCIDENT_IMAGE_URL_MAX) {
    throw new Error(`At most ${INCIDENT_IMAGE_URL_MAX} photos per report`);
  }
  const urls: string[] = [];
  for (const file of files) {
    const pathname = `incidents/photos/${crypto.randomUUID()}-${safeImageFilename(file.name)}`;
    const result = await upload(pathname, file, {
      access: "public",
      handleUploadUrl: "/api/incidents/blob-upload",
      contentType: file.type || undefined,
    });
    urls.push(result.url);
  }
  return urls;
}

export async function createIncident(body: IncidentCreate) {
  const res = await apiFetch("/api/incidents", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as {
      error?: string;
      hint?: string;
      details?: {
        formErrors?: string[];
        fieldErrors?: Record<string, string[] | undefined>;
      };
    };
    const formErrors = j.details?.formErrors ?? [];
    const fieldErrors = j.details?.fieldErrors ?? {};
    if (formErrors.length > 0 || Object.keys(fieldErrors).length > 0) {
      throw new ValidationFailedError(
        { formErrors, fieldErrors },
        j.error ?? "Validation failed",
      );
    }
    const msg = j.error ?? "Save failed";
    throw new Error(j.hint ? `${msg} — ${j.hint}` : msg);
  }
  return res.json();
}

export type What3WordsSuggestion = { words: string; nearestPlace: string };

export async function fetchWhat3WordsAutosuggest(
  input: string,
): Promise<{ suggestions: What3WordsSuggestion[] }> {
  const q = input.trim();
  const params = new URLSearchParams({ input: q });
  const res = await fetch(`/api/what3words/autosuggest?${params.toString()}`, {
    credentials: "include",
  });
  if (res.status === 503) {
    return { suggestions: [] };
  }
  if (!res.ok) {
    throw new Error("what3words suggest failed");
  }
  return res.json() as Promise<{ suggestions: What3WordsSuggestion[] }>;
}

function w3wClientErrorMessage(status: number, fallback: string, j: { error?: string }): string {
  if (status === 503) {
    return j.error ?? "what3words is not configured on the server (set W3W_API_KEY).";
  }
  if (status === 401) {
    return "Sign in again, then retry.";
  }
  return j.error ?? fallback;
}

const W3W_PROXY_HINT =
  "Got HTML instead of JSON — the API server is not running on port 3000 or /api is not proxied. Run `npm run dev`, or in two terminals: `npm run dev:api` then `npm run dev:vite -- --host`.";

function parseWhat3WordsProxyBody(text: string): {
  error?: string;
  words?: string;
  nearestPlace?: string;
  country?: string;
} {
  const trimmed = text.trim();
  if (!trimmed) return {};
  if (trimmed.startsWith("<")) {
    throw new Error(W3W_PROXY_HINT);
  }
  try {
    return JSON.parse(text) as {
      error?: string;
      words?: string;
      nearestPlace?: string;
      country?: string;
    };
  } catch {
    throw new Error(`what3words proxy returned non-JSON: ${trimmed.slice(0, 120)}`);
  }
}

export async function fetchWhat3WordsConvert(words: string): Promise<{
  words: string;
  nearestPlace: string;
  country: string;
}> {
  const params = new URLSearchParams({ words: words.trim() });
  const res = await fetch(`/api/what3words/convert?${params.toString()}`, {
    credentials: "include",
  });
  const j = parseWhat3WordsProxyBody(await res.text());
  if (!res.ok) {
    throw new Error(
      w3wClientErrorMessage(res.status, "Could not verify what3words address", j),
    );
  }
  if (!j.words) {
    throw new Error(
      j.error ?? "Could not verify what3words address (response had no words field)",
    );
  }
  return {
    words: j.words,
    nearestPlace: j.nearestPlace ?? "",
    country: j.country ?? "",
  };
}

/** Reverse geocode: device GPS → three-word address (server calls what3words convert-to-3wa). */
export async function fetchWhat3WordsFromCoordinates(
  lat: number,
  lng: number,
): Promise<{ words: string; nearestPlace: string; country: string }> {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
  });
  const res = await fetch(`/api/what3words/coordinates?${params.toString()}`, {
    credentials: "include",
  });
  const j = parseWhat3WordsProxyBody(await res.text());
  if (!res.ok) {
    throw new Error(
      w3wClientErrorMessage(res.status, "Could not get what3words from location", j),
    );
  }
  if (!j.words) {
    throw new Error(
      j.error ??
        "Could not get what3words from location (response had no words field). Check W3W_API_KEY and server logs.",
    );
  }
  return {
    words: j.words,
    nearestPlace: j.nearestPlace ?? "",
    country: j.country ?? "",
  };
}

export async function downloadIncidentsCsv() {
  const res = await fetch("/api/incidents/export", { credentials: "include" });
  if (!res.ok) throw new Error("Could not download CSV");
  const blob = await res.blob();
  const cd = res.headers.get("Content-Disposition");
  const m = cd?.match(/filename="([^"]+)"/);
  const filename = m?.[1] ?? "jalsa-incidents.csv";
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
