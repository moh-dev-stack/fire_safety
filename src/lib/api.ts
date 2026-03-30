import type { IncidentCreate } from "../model/incident";

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
      "Cannot reach the server. Run `npm run dev:all` (starts API on :3000 and this site on :5173), then open http://localhost:5173/",
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

export async function me(): Promise<boolean> {
  const res = await apiFetch("/api/me");
  return res.ok;
}

export async function fetchIncidents() {
  const res = await apiFetch("/api/incidents");
  if (!res.ok) throw new Error("Failed to load incidents");
  return res.json();
}

export async function createIncident(body: IncidentCreate) {
  const res = await apiFetch("/api/incidents", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as {
      error?: string;
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
    throw new Error(j.error ?? "Save failed");
  }
  return res.json();
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
