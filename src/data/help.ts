/** Static Help page copy - replace placeholders with real site numbers before Jalsa. */

export const helpIntro = {
  title: "Help",
  subtitle: "Emergencies, contacts, and when to use the incident form",
  lead: `If someone is in immediate danger, needs urgent medical help, or there is a life-threatening
    situation, use the emergency services first. This screen explains what to do before you log
    anything in the app.`,
};

export type HelpSection = {
  title: string;
  paragraphs: string[];
};

export const helpSections: HelpSection[] = [
  {
    title: "Life-threatening emergencies",
    paragraphs: [
      "Dial 999 for ambulance, police, or fire if the situation is urgent or life-threatening.",
      "Then follow local Jalsa procedures and notify site control / fire & safety duty as soon as you safely can.",
    ],
  },
  {
    title: "Site control and duty contacts (replace with real details)",
    paragraphs: [
      "Duty phone: [Add number]",
      "Radio / channel: [Add channel or call sign]",
      "Fire & safety control / duty office: use the site map for the exact location.",
    ],
  },
  {
    title: "Assembly and medical points (replace with real details)",
    paragraphs: [
      "Main assembly point(s): [Add brief description or map reference]",
      "Medical / first-aid tent: [Add location]",
    ],
  },
  {
    title: "When to use the incident report form",
    paragraphs: [
      "Use Report after the situation is under control or when it is safe to do so, to record fire & safety related events (alarms, medical issues on site, crowd issues, weather impact, equipment faults, hazards).",
      "The form is not a substitute for 999 or immediate verbal escalation to duty leads.",
    ],
  },
];
