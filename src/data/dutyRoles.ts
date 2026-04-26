/** Operational / volunteer role descriptions - edit copy for your Jalsa team. */

export type DutyRole = {
  title: string;
  summary: string;
  tips?: string[];
};

export const dutyRolesIntro = {
  title: "Roles",
  subtitle: "What common Jalsa duty roles involve",
  body: `These descriptions are a quick guide for volunteers. They are separate from the fire & safety
    team contacts on the Team page. Ask your duty lead if you are unsure what applies to your shift.`,
};

export const dutyRoles: DutyRole[] = [
  {
    title: "Sweeper",
    summary:
      "Helps keep paths and areas tidy and safe: litter, trip hazards, and obvious obstructions. Escalates anything that could affect crowd flow or safety to marshals or control.",
    tips: [
      "Report broken glass, spills, or blocked exits to duty straight away.",
      "Do not move equipment that belongs to another team without checking.",
    ],
  },
  {
    title: "Announcer / PA",
    summary:
      "Delivers public messages calmly and clearly. Follows an agreed script or instructions from organisers; does not improvise safety or evacuation content unless authorised.",
    tips: [
      "Confirm wording with control before announcements that affect movement or safety.",
      "Keep messages short and repeated if needed.",
    ],
  },
  {
    title: "Marshal / steward",
    summary:
      "Guides pedestrian flow, answers basic directions, and spots overcrowding or risk. Defers serious incidents to medical, fire & safety, or police as appropriate.",
    tips: [
      "Stay visible and approachable; radio or phone control if crowds build unexpectedly.",
      "Use the incident form for notable events once it is safe to do so.",
    ],
  },
  {
    title: "Gate / entrance team",
    summary:
      "Manages entry flow, bag checks if applicable, and directs people away from unsafe areas. Coordinates with parking and control during congestion.",
    tips: [
      "Escalate queues that block roads or emergency routes immediately.",
    ],
  },
  {
    title: "Langar / marquee support",
    summary:
      "Supports serving areas and queues. Watches for slips, spills, hot surfaces, and children near service lines; escalates injuries or fire risks to duty.",
    tips: [
      "Keep walkways clear; mark wet floors where possible.",
    ],
  },
];
