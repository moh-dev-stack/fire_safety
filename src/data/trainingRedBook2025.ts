/**
 * 2025 Red Book - internal action / retrospective points. Abbreviated for web; full list in the PDF.
 */

export type RedBookDepartment = {
  name: string;
  themes: readonly { title: string; summary: string }[];
};

export const RED_BOOK_2025_DEPARTMENTS: readonly RedBookDepartment[] = [
  {
    name: "Signage",
    themes: [
      {
        title: "Signage deployment timing",
        summary:
          "When other nizamats are not ready in the original window, signs slip and have to be reworked. Build buffer into the programme and rota, including pre-event days if agreed.",
      },
    ],
  },
  {
    name: "Operations / SOPs",
    themes: [
      {
        title: "Jamia inspections",
        summary:
          "Last-minute Saturday inspection calls caused disruption. Pre-book visits, brief local nizamats, and have a named person on a standard prep schedule (including Saturday morning where needed).",
      },
      {
        title: "Pre-event staffing",
        summary:
          "Short staffing Wed–Thu before Jalsa. Consider a pre-event rotation, clearer rota comms, and early booking of leave where possible.",
      },
    ],
  },
  {
    name: "Training",
    themes: [
      {
        title: "Consistent fire-duty training",
        summary:
          "Nizamats had uneven training. Standardise a very short (e.g. sub–2 min) “fire-safety essentials” at shift start, with laminated quick-reference material and a longer pre-Jalsa session for those who can attend.",
      },
      {
        title: "Main marquee announcement",
        summary:
          "A short, repeatable live announcement (exits, expectations) at session starts was suggested - coordinate with comms/announcers.",
      },
      {
        title: "One-day helpers",
        summary:
          "Single-day cover did not build enough familiarity. Some teams may require a minimum of two days; balance with individual circumstances where policy allows.",
      },
    ],
  },
  {
    name: "Equipment",
    themes: [
      {
        title: "Extinguisher checks",
        summary:
          "Inconsistent pre-use checks. Train each nizamat to verify gauge, seal, and nozzle in a quick routine during briefings; reinforce cost of failure.",
      },
      {
        title: "Gas and hydrants",
        summary:
          "A maintenance-related gas issue and hydrant siting/availability need escalation to maintenance, H&S, and water authority - not a single-team fix. Low-cost risk mitigations (e.g. SOPs near canisters) were discussed.",
      },
    ],
  },
  {
    name: "Admin / comms / site",
    themes: [
      {
        title: "Smoking areas",
        summary:
          "Smoking in undesignated spots and untidy bin areas. Add signed bins, sweeps, loving guidance to volunteers, and patrol checklists; coordinate locations with nizamats.",
      },
      {
        title: "Patrols and tree line",
        summary:
          "Fenced/edge areas need explicit patrol checklists; work with Bairoon and other areas so zones are not blind spots.",
      },
      {
        title: "Safety tent and medical comms",
        summary:
          "Tent could not follow talks - portable PA/feed suggested. Medical channel overload: dedicated radio where possible, passed to comms/MR as appropriate.",
      },
      {
        title: "Night rota and admin workload",
        summary:
          "Shifts and Tahajjud/Fajr coverage felt misaligned; job descriptions, early calendar planning, shared checklists, and visibility of task tracking were raised (some items marked for MR / tooling later).",
      },
    ],
  },
] as const;

export const RED_BOOK_2025_INTRO = [
  "The Red Book captures problem → solution style notes, often with an “allocation” for follow-up. Departments used in the source include Admin, Operations, SOPs, Training, Equipment, and Signage - groupings below follow those themes in plain language on the web.",
  "Write the problem, possible fix, and who will chase it. Action points for the following year are agreed outside this app.",
] as const;
