/**
 * Training copy: UK-style fire classes and extinguisher matching (POC — confirm with PM / H&S).
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
    examples: "Petrol, solvents, paints — flammable liquids.",
  },
  {
    code: "Class C",
    title: "Gases",
    examples: "Flammable gas involved — typically **isolate the gas** first; extinguishers alone may not be enough.",
  },
  {
    code: "Class F",
    title: "Cooking oils & fats",
    examples: "Deep fat fryers, hot oil in catering — needs compatible agents (often wet chemical).",
  },
  {
    code: "Electrical",
    title: "Live electrical equipment",
    examples: "Panels, cables, appliances **while energised** — use a type that does not conduct (e.g. CO₂, dry powder); switch off if safe.",
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
    goodFor: "Class A fires — cooling the fuel.",
    avoidOrCaution:
      "Never on live electrical equipment or burning oil/fat. Do not use on Class B liquids.",
  },
  {
    id: "foam",
    title: "Foam",
    goodFor: "Class A and many Class B — film helps smother liquid surfaces.",
    avoidOrCaution: "Check label; typical foam is **not** for live electrics or deep fat (Class F).",
  },
  {
    id: "co2",
    title: "CO₂",
    goodFor: "Class B liquids and **electrical** (no residue on delicate gear) when used correctly.",
    avoidOrCaution:
      "Cold discharge — frost burn risk; poor ventilation / confined space CO₂ buildup — use with care. Not for Class A deep-seated embers.",
  },
  {
    id: "dry-powder",
    title: "Dry powder (ABC or BC)",
    goodFor:
      "Broad multipurpose on A, B, C (gas **after** isolation where practicable) and electrical in many cases — read the label.",
    avoidOrCaution:
      "Visibility and breathing in enclosed spaces; residue damages electronics and machinery — clean-up needed.",
  },
  {
    id: "wet-chemical",
    title: "Wet chemical",
    goodFor: "Class F cooking oil / fat — saponification-cools and seals surface.",
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

/** Exactly five multiple-choice questions (client-side scoring). */
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
    prompt: "Which extinguisher type is generally **unsuitable** for live electrical equipment?",
    options: ["CO₂", "Dry powder", "Water", "Wet chemical"],
    correctIndex: 2,
    rationale:
      "Straight water conducts electricity and can spread shock hazard — do not use on energised electrics.",
  },
  {
    id: "q3",
    prompt: "A deep fat fryer is on fire in the langar. Which type is **most appropriate** on the label?",
    options: ["Water", "Foam only", "Wet chemical (Class F)", "Blanket only — no extinguisher"],
    correctIndex: 2,
    rationale:
      "Cooking oil/fat fires need an agent rated for Class F; wet chemical is designed for this scenario.",
  },
  {
    id: "q4",
    prompt: "Dry powder is described as “multipurpose”. What is a common **drawback** in use?",
    options: [
      "It only works outdoors",
      "It leaves residue and can reduce visibility in confined spaces",
      "It cannot be used on Class B",
      "It must be stored below freezing",
    ],
    correctIndex: 1,
    rationale:
      "Powder can obscure vision and needs clean-up; still widely used for fast knock-down when appropriate.",
  },
  {
    id: "q5",
    prompt: "Removing **oxygen** from a small contained fire (pan with lid; closing a door) works because…",
    options: [
      "It adds fuel",
      "It starves the fire of one side of the triangle",
      "It increases electrical voltage",
      "It replaces heat with cold air only",
    ],
    correctIndex: 1,
    rationale:
      "Smothering / sealing reduces oxygen — one practical way to break the triangle when it is safe to do so.",
  },
];

export const TRAINING_FIRE_TRIANGLE = {
  imageSrc: "/training/fire-triangle.png",
  imageAlt:
    "Fire Triangle diagram: Heat (red), Fuel (orange), and Oxygen (blue) with a flame icon where the three sides meet; caption Fire Triangle",
  summary:
    "Think **fuel**, **heat**, and **oxygen**. Fire is a chemical reaction that keeps going while all three are present in the right proportions. Take away cooling (water on Class A), smother (foam, CO₂, powder, blanket), or remove fuel/gas, and the fire stops.",
} as const;

/** Poster-style matrix: extinguisher types vs classes of fire (checks and crosses). */
export const TRAINING_EXTINGUISHER_CHART = {
  imageSrc: "/training/extinguisher-selection-chart.png",
  imageAlt:
    "Chart: What fire extinguisher should I use — water, foam, CO2, powder, wet chemical versus Class A, B, C, electrical, and Class F fires, with ticks and crosses",
  title: "What fire extinguisher should I use?",
} as const;
