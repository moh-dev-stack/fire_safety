function isDisabled(v: string | undefined): boolean {
  const s = (v ?? "").trim().toLowerCase();
  return s === "0" || s === "false" || s === "no" || s === "off";
}

/** Training page: triangle, extinguisher chart, types, quiz (`/training`; `/training/fire-extinguishers` redirects). Default: on. */
export const ENABLE_TRAINING_MODULE = !isDisabled(import.meta.env.VITE_ENABLE_TRAINING);

/** Venue readiness checklist (`/venue-checklist`). Default: on. */
export const ENABLE_VENUE_CHECKLIST = !isDisabled(
  import.meta.env.VITE_ENABLE_VENUE_CHECKLIST,
);
