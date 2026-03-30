/** Turn Zod `flatten()` / API `details` into user-facing lines (one issue per line). */
const FIELD_LABELS: Record<string, string> = {
  incident_date: "Incident date",
  incident_time: "Time on site",
  incident_type: "Fire & safety category",
  severity: "Severity",
  location: "Location on site",
  description: "What happened",
  actions_taken: "Actions taken",
  reporter_name: "Your name",
};

export function formatFlattenedZodError(flat: {
  formErrors: string[];
  fieldErrors: Record<string, string[] | undefined>;
}): string {
  const lines: string[] = [];
  for (const msg of flat.formErrors) {
    if (msg) lines.push(msg);
  }
  for (const [key, msgs] of Object.entries(flat.fieldErrors)) {
    if (!msgs?.length) continue;
    const label = FIELD_LABELS[key] ?? key;
    for (const m of msgs) {
      if (m) lines.push(`${label}: ${m}`);
    }
  }
  return lines.length > 0 ? lines.join("\n") : "Validation failed. Check all required fields.";
}
