export type TeamGroup = {
  title: string;
  body: string;
};

/** Three organisational layers only — no individual names or contact details. */
export const teamGroups: TeamGroup[] = [
  {
    title: "Kek Fire and Safety Team",
    body: "Central fire and safety leadership and coordination for Jalsa Salana.",
  },
  {
    title: "External Kek Fire and Safety Team",
    body: "Fire and safety support deployed for the event from outside the local area.",
  },
  {
    title: "Local Team",
    body: "Local fire and safety volunteers and on-site coordination.",
  },
];

export const teamIntro = {
  title: "Fire & Safety Team",
  subtitle: "Jalsa Salana 2026 · 24–26 July · Islamabad, UK",
  body: `Fire and safety is organised in three layers: the Kek Fire and Safety Team, the External Kek Fire and Safety Team, and the local team.
    Submit incident reports as soon as practical after an event, and keep the site map handy for orientation.`,
};
