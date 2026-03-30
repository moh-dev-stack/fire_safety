export type TeamMember = {
  role: string;
  name: string;
  contact: string;
  notes: string;
};

export const teamMembers: TeamMember[] = [
  {
    role: "Fire Safety Lead",
    name: "Person A",
    contact: "persona@example.com · 07123 456789",
    notes: "Overall coordination for fire and safety during Jalsa Salana 2026.",
  },
  {
    role: "Deputy Lead",
    name: "Person B",
    contact: "personb@example.com · 07123 456790",
    notes: "Deputises for the lead; first point of escalation.",
  },
  {
    role: "Site Liaison",
    name: "Person C",
    contact: "personc@example.com · 07123 456791",
    notes: "Coordinates with site operations and venue marshalling.",
  },
];

export const teamIntro = {
  title: "Fire & Safety Team",
  subtitle: "Jalsa Salana 2026 · 24–26 July · Islamabad, UK",
  body: `This team supports safe conduct of Jalsa Salana 2026. Use the rota for shift times,
    submit incident reports as soon as practical after an event, and keep the site map handy for orientation.`,
};
