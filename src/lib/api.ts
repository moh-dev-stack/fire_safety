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

export async function fetchIncidents(eventId: string) {
  const q = new URLSearchParams({ event_id: eventId });
  const res = await apiFetch(`/api/incidents?${q}`);
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
    throw new Error(j.hint ? `${msg} - ${j.hint}` : msg);
  }
  return res.json();
}

export async function downloadIncidentsCsv(eventId: string) {
  const q = new URLSearchParams({ event_id: eventId });
  const res = await fetch(`/api/incidents/export?${q}`, { credentials: "include" });
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
