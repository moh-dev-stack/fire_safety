/**
 * Training copy: UK-style fire classes and extinguisher matching (POC - confirm with PM / H&S).
 */

export type FireClass = {
  code: string;
  title: string;
  examples: string;
};

export const FIRE_CLASSES_UK: readonly FireClass[] = [
  {
    code: "Class A",
    title: "Solids",
    examples: "Wood, paper, textiles, many ordinary combustibles.",
  },
  {
    code: "Class B",
    title: "Liquids",
    examples: "Petrol, solvents, paints - flammable liquids.",
  },
  {
    code: "Class C",
    title: "Gases",
    examples: "Flammable gas involved - typically **isolate the gas** first; extinguishers alone may not be enough.",
  },
  {
    code: "Class F",
    title: "Cooking oils & fats",
    examples: "Deep fat fryers, hot oil in catering - needs compatible agents (often wet chemical).",
  },
  {
    code: "Electrical",
    title: "Live electrical equipment",
    examples: "Panels, cables, appliances **while energised** - use a type that does not conduct (e.g. CO₂, dry powder); switch off if safe.",
  },
];

export type ExtinguisherType = {
  id: string;
  title: string;
  goodFor: string;
  avoidOrCaution: string;
};

export const EXTINGUISHER_TYPES: readonly ExtinguisherType[] = [
  {
    id: "water",
    title: "Water (red)",
    goodFor: "Class A fires - cooling the fuel.",
    avoidOrCaution:
      "Never on live electrical equipment or burning oil/fat. Do not use on Class B liquids.",
  },
  {
    id: "foam",
    title: "Foam",
    goodFor: "Class A and many Class B - film helps smother liquid surfaces.",
    avoidOrCaution: "Check label; typical foam is **not** for live electrics or deep fat (Class F).",
  },
  {
    id: "co2",
    title: "CO₂",
    goodFor: "Class B liquids and **electrical** (no residue on delicate gear) when used correctly.",
    avoidOrCaution:
      "Cold discharge - frost burn risk; poor ventilation / confined space CO₂ buildup - use with care. Not for Class A deep-seated embers.",
  },
  {
    id: "dry-powder",
    title: "Dry powder (ABC or BC)",
    goodFor:
      "Broad multipurpose on A, B, C (gas **after** isolation where practicable) and electrical in many cases - read the label.",
    avoidOrCaution:
      "Visibility and breathing in enclosed spaces; residue damages electronics and machinery - clean-up needed.",
  },
  {
    id: "wet-chemical",
    title: "Wet chemical",
    goodFor: "Class F cooking oil / fat - saponification-cools and seals surface.",
    avoidOrCaution: "Purpose-built for kitchens; not the default choice for other fire classes.",
  },
];

export type TrainingQuizQuestion = {
  id: string;
  prompt: string;
  options: readonly string[];
  correctIndex: number;
  rationale: string;
};

/** Nine multiple-choice questions (client-side scoring), aligned to the Jalsa training module. */
export const FIRE_EXTINGUISHER_QUIZ: readonly TrainingQuizQuestion[] = [
  {
    id: "q1",
    prompt: "The fire triangle is made of which three things?",
    options: [
      "Fuel, heat, oxygen",
      "Smoke, flame, water",
      "Alarm, exit, assembly point",
      "Carbon, hydrogen, nitrogen",
    ],
    correctIndex: 0,
    rationale:
      "Fire needs fuel, heat (ignition energy), and oxygen. Removing any one side stops the reaction.",
  },
  {
    id: "q2",
    prompt: "Which of the following is not part of the fire triangle?",
    options: ["Fuel", "Oxygen", "Carbon dioxide", "Heat"],
    correctIndex: 2,
    rationale:
      "The triangle is fuel, heat, and oxygen. CO₂ is used in some extinguishers to displace oxygen - it is not a ‘side’ of the triangle itself.",
  },
  {
    id: "q3",
    prompt: "What is meant by the term “flash point”?",
    options: [
      "The highest temperature at which a material ignites",
      "The lowest temperature at which a material ignites",
      "The point when smoke is visible",
      "The point when water boils off the surface",
    ],
    correctIndex: 1,
    rationale:
      "Flash point is the lowest temperature at which enough vapour is given off to ignite, given a suitable ignition source.",
  },
  {
    id: "q4",
    prompt: "Which extinguisher type is generally unsuitable for live electrical equipment?",
    options: ["CO₂", "Dry powder", "Water", "Wet chemical"],
    correctIndex: 2,
    rationale:
      "Straight water conducts electricity and can spread shock hazard - do not use on energised electrics unless your appliance and procedure specifically allow a mist-type agent (follow your brief).",
  },
  {
    id: "q5",
    prompt: "A deep fat fryer is on fire in the langar. Which type is most appropriate on the label?",
    options: ["Water", "Foam only", "Wet chemical (Class F)", "CO₂ only"],
    correctIndex: 2,
    rationale:
      "Class F (cooking oil) needs an agent designed for that risk - typically wet chemical for commercial fryers.",
  },
  {
    id: "q6",
    prompt: "You see a fire has started in a marquee. What should you do first?",
    options: [
      "Raise the alarm and follow the site process (e.g. CoC / KeK)",
      "Run in alone to try to put it out before anyone else notices",
      "Leave the area without telling anyone",
      "Collect personal belongings, then head to an exit",
    ],
    correctIndex: 0,
    rationale:
      "Raise the alarm and use your command chain before fighting any fire. Heroics without a report can delay evacuations and help.",
  },
  {
    id: "q7",
    prompt: "“Site Clear” in the Jalsa briefing usually means: evacuation is complete, but people should…",
    options: [
      "Return to their seats after a quick look around",
      "Stay away - the area is not yet confirmed safe to re-enter",
      "Disperse to any exit they prefer without an announcer",
      "Go home; the event is over",
    ],
    correctIndex: 1,
    rationale:
      "Site Clear means the area has been cleared but is not yet signed off for return; wait for All Clear when the plan says it is safe.",
  },
  {
    id: "q8",
    prompt: "What are the “three C’s” of crowd control in the Jalsa training module?",
    options: [
      "Calm, collectiveness, and coherence",
      "Coolness, loud, and coherence",
      "Calm, cohesive, and coherence",
      "Combined, calm, and cool",
    ],
    correctIndex: 0,
    rationale:
      "The module uses calm, collectiveness (one shared protocol), and coherence (clear, firm, CoC-led action).",
  },
  {
    id: "q9",
    prompt: "For a Jalsa worker, what is usually the first point of escalation in an emergency?",
    options: [
      "Head of department (fire marshal)",
      "Fire brigade (999) immediately, always",
      "Command centre (CoC / site control) as your briefing defines",
      "Police first",
    ],
    correctIndex: 2,
    rationale:
      "Follow the chain you are given: contact Command and Control / the named desk unless the situation and policy say to call 999 directly.",
  },
];

export const TRAINING_FIRE_TRIANGLE = {
  imageSrc: "/training/fire-triangle.png",
  imageAlt:
    "Fire Triangle diagram: Heat (red), Fuel (orange), and Oxygen (blue) with a flame icon where the three sides meet; caption Fire Triangle",
  summary:
    "Heat, fuel, and oxygen must all be present for a fire to start and keep burning. Remove one (cool Class A fuel with water, smother with foam, CO₂, powder, or a blanket, cut off gas, or reduce oxygen) and the fire stops. Different fuels have different flash points; combustion often produces more heat, so act early and only within your training.",
} as const;

/** Poster-style matrix: extinguisher types vs classes of fire (checks and crosses). */
export const TRAINING_EXTINGUISHER_CHART = {
  imageSrc: "/training/extinguisher-selection-chart.png",
  imageAlt:
    "Chart: What fire extinguisher should I use - water, foam, CO2, powder, wet chemical versus Class A, B, C, electrical, and Class F fires, with ticks and crosses",
  title: "What fire extinguisher should I use?",
} as const;
