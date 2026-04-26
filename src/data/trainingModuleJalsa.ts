/**
 * Jalsa fire & safety training (web summary - full detail in module PDF and FSO sub-page).
 */

export const TRAINING_LEARNING_OUTCOMES: readonly string[] = [
  "Why fire safety matters and what can go wrong on site",
  "How fire spreads and what the fire triangle means in practice",
  "Fire prevention and working with your local Khidmat / KeK team",
  "What to do in an evacuation: alarms, CoC, assembly points, 999",
  "Crowd control and keeping people calm and directed",
] as const;

export const TRAINING_FSO_INTRO =
  "UK events rely on the Regulatory Reform (Fire Safety) Order 2005: risk assessments, precautions, and clear responsibilities. A fuller plain-language summary for Jalsa in the UK is on a separate page - useful background for everyone on duty.";

export const TRAINING_KEY_TERMS_FLASHPOINT =
  "The flash point is the lowest temperature at which a material gives off enough vapour to ignite (with a spark or flame). Different fuels behave differently; always follow site-specific briefings, not this page alone.";

export const TRAINING_PREVENTION_KEK =
  "Be vigilant: check your area, keep escape routes and equipment access clear, and report faults. Khidmat-e-Khalq (KeK) lead fire safety and evacuation on site. Local roles (Afsar KeK, Naib Afsar, etc.) are accountable to the council and coordinate with you - follow the chain you are given at briefing.";

export const TRAINING_FIRE_ACTION_STEPS: readonly string[] = [
  "Raise the alarm and contact Command and Control (CoC) / KeK as your briefing directs.",
  "Assess whether you can do anything safely, or if you need to get people out first.",
  "Evacuate to the nearest assembly point; follow exit signs. Do not stop for belongings. Do not re-enter until the **All Clear**.",
  "Only call 999 if you are instructed to, or the situation is clearly a major emergency and your process says to - avoid duplicate conflicting calls.",
  "This is a no-smoking main venue: enforce politely and use designated smoking areas where they exist off the main field.",
] as const;

export type EvacuationBullet = { title: string; body: string };

export const TRAINING_EVACUATION: {
  intro: string;
  types: readonly EvacuationBullet[];
  protocol: readonly string[];
  siteClearVsAllClear: { siteClear: string; allClear: string };
} = {
  intro:
    "Any evacuation is a Safety & Security (KeK) issue. The scenario decides whether you clear a specific area or the whole site.",
  types: [
    {
      title: "Evacuation types",
      body: "Specific area - a limited zone (e.g. one marquee). Full site - everyone must leave. Match your actions to the announcer and CoC, not to rumours.",
    },
    {
      title: "What drives the type?",
      body: "Minor events (e.g. small, contained fire) may not need a full site evacuation. Major events (e.g. widespread fire, major gas, credible bomb threat) require wider control - follow the plan you are given.",
    },
  ] as const,
  protocol: [
    "Afsar KeK / Naib Afsar / Fire Safety Officer may decide the evacuation and messaging.",
    "Know who the announcer is for your area. Only act on their instructions, not ad-hoc instructions from the crowd.",
    "Roles often include: directing marshals, announcers, radio communicators, and sweepers. Wait for Site Clear or All Clear as defined on site.",
  ] as const,
  siteClearVsAllClear: {
    siteClear:
      "Evacuation of the area is complete; no-one should re-enter until the situation is resolved and a further instruction is given.",
    allClear:
      "The area has been inspected and is safe for people to return - this is the signal that normal use can resume where the plan allows.",
  },
};

export const TRAINING_CROWD_CONTROL: {
  threeCs: { label: string; items: readonly string[] }[];
  points: readonly string[];
} = {
  threeCs: [
    {
      label: "Calm",
      items: [
        "Model calm behaviour; give clear, regular instructions; watch the crowd for panic or bottlenecks.",
      ],
    },
    {
      label: "Collectiveness",
      items: [
        "One shared protocol: everyone in your team knows the evacuation and crowd plan before the rush.",
      ],
    },
    {
      label: "Coherence",
      items: [
        "Be firm and polite; follow CoC, not the public’s loudest voice; use open posture and clear hand signals to guide flow.",
      ],
    },
  ] as const,
  points: [
    "Shock, medical need, and restlessness are common - get help early (medical, security, more marshals).",
    "Vulnerable people (children, restricted mobility) may need more time; factor them into sweeps and routes.",
    "Report emerging incidents; escalate to CoC rather than acting alone in ways that block exits.",
  ] as const,
};
