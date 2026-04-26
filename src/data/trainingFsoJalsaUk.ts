/**
 * FSO 2005 + Jalsa (UK) - web summary. Full text in the PDF.
 */

export type FsoDuty = {
  id: string;
  title: string;
  bullets: readonly string[];
};

export const FSO_DUTIES: readonly FsoDuty[] = [
  {
    id: "1",
    title: "Responsible person",
    bullets: [
      "If you organise the event, you are typically the “responsible person” under the Order.",
      "Take general fire precautions, protect staff, volunteers, and the public, appoint competent people (e.g. fire marshals), and carry out a proper fire risk assessment.",
    ],
  },
  {
    id: "2",
    title: "Fire risk assessment",
    bullets: [
      "Document hazards (cooking, electrics, fuels), who is at risk, how you reduce or remove risk, and evacuation roles.",
      "Review and update the assessment for each event cycle.",
    ],
  },
  {
    id: "3",
    title: "Prevention",
    bullets: [
      "Housekeeping, safe use of gas/electrical/cooking kit, no smoking in risk areas with clear signage, safe storage of LPG and fuel.",
    ],
  },
  {
    id: "4",
    title: "Emergency plan and evacuation",
    bullets: [
      "Written fire emergency plan, trained volunteers, signposted escape routes, drills for marshals where appropriate, emergency lighting and signs.",
    ],
  },
  {
    id: "5",
    title: "Detection and fire-fighting equipment",
    bullets: [
      "Detection where practical, maintained extinguishers and blankets, trained users, and checks before and during the event.",
    ],
  },
  {
    id: "6",
    title: "Information, instruction, and training",
    bullets: [
      "Training and written information on evacuation, and a way to tell everyone on site (PA, radio, other means).",
    ],
  },
  {
    id: "7",
    title: "Coordination",
    bullets: [
      "Where several teams or contractors are on site, coordinate duties and share risk assessments and plans.",
    ],
  },
  {
    id: "8",
    title: "Access for fire and rescue",
    bullets: [
      "Clear routes for emergency vehicles, site maps shared, and a liaison process during the event.",
    ],
  },
] as const;

export const FSO_NON_COMPLIANCE: readonly string[] = [
  "Enforcement or prohibition of the event, fines, or prosecution, depending on severity.",
] as const;

export type FsoJalsaRow = { area: string; action: string };

export const FSO_JALSA_SUMMARY: readonly FsoJalsaRow[] = [
  { area: "Fire risk assessment", action: "Completed, documented, updated" },
  { area: "Escape routes", action: "Clear, marked, lit, unobstructed" },
  { area: "Fire equipment", action: "Properly placed, maintained, trained users" },
  { area: "Emergency plan", action: "Written, communicated, rehearsed" },
  { area: "Fire marshals", action: "Trained, equipped, coordinated" },
  { area: "Information", action: "Signage, briefings, public announcements" },
  { area: "Coordination", action: "Liaise with emergency services, suppliers" },
] as const;

/** Short labels for the checklist (full table in PDF). */
export const FSO_CHECKLIST_ITEMS: readonly string[] = [
  "Fire risk assessment completed and updated before the event",
  "Hazards identified and mitigations recorded; vulnerable groups considered",
  "Emergency evacuation plan in place; exits checked and signposted",
  "Extinguishers and blankets at key locations, inspected and maintained",
  "Cooking, gas, and electrical systems managed safely; waste and combustibles controlled",
  "No smoking in risk areas; signage; detection where high-risk",
  "Marshals trained; drills or rehearsals as planned; comms (PA, radio) work",
  "Fire service access and liaison arranged; information to all staff/volunteers",
] as const;
