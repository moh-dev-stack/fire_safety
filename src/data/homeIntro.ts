import {
  ENABLE_TRAINING_MODULE,
  ENABLE_VENUE_CHECKLIST,
} from "../config/features";

export type HomeTabInfo = { label: string; path: string; description: string };

/** Ordered like the main nav: Home first, then the rest. */
export function getAdminHomeTabs(): HomeTabInfo[] {
  const tabs: HomeTabInfo[] = [
    {
      label: "Home",
      path: "/",
      description: "This screen: a short map of the app. Use the tabs to switch areas.",
    },
    {
      label: "Team",
      path: "/team",
      description: "Who is on the fire and safety team, layers of responsibility, and how to find people when you are on shift.",
    },
    {
      label: "Rota",
      path: "/rota",
      description: "Who is on duty and when, by day and shift, so you can see coverage during Jalsa.",
    },
  ];
  if (ENABLE_TRAINING_MODULE) {
    tabs.push(
      {
        label: "Training",
        path: "/training",
        description:
          "Fire safety training: use the two tabs at the top of Training for the Jalsa module and a Fire Safety Order 2005 brief, then the full FSO and Jalsa (UK) page. For leads, the Red Book is a separate item in the nav.",
      },
      {
        label: "Red Book",
        path: "/training/red-book-2025",
        description: "Internal 2025 action and retrospective points for organisers (read-only summary and PDF).",
      },
    );
  }
  if (ENABLE_VENUE_CHECKLIST) {
    tabs.push({
      label: "Venue",
      path: "/venue-checklist",
      description: "Venue walk-round checklist by area (kitchen, car park, langar) for pre-event and during-event checks.",
    });
  }
  tabs.push(
    {
      label: "Report",
      path: "/incidents",
      description: "Submit a fire and safety related incident: what happened, where, severity, and optional photos.",
    },
    {
      label: "Log",
      path: "/incidents/log",
      description: "Read past reports, search and filter, and download incidents as a CSV (duty leads and admins).",
    },
    {
      label: "Map",
      path: "/map",
      description: "Map of the Jalsa site (Islamabad, UK) for orientation and when giving directions over the radio.",
    },
    {
      label: "Help",
      path: "/help",
      description: "Emergencies (999), site contacts, assembly points, and when to use the report form instead.",
    },
    {
      label: "Roles",
      path: "/roles",
      description: "Short descriptions of on-site fire and safety roles and what they are for.",
    },
  );
  return tabs;
}

export function getUserHomeTabs(): HomeTabInfo[] {
  const tabs: HomeTabInfo[] = [
    {
      label: "Home",
      path: "/",
      description: "This screen: what each tab in your menu is for. You have a cut-down set of pages (report, training, help).",
    },
    {
      label: "Report",
      path: "/incidents",
      description: "Log a fire and safety issue on site: type, location, time, and what you did. Use after people are safe and when you can add detail.",
    },
  ];
  if (ENABLE_TRAINING_MODULE) {
    tabs.push({
      label: "Training",
      path: "/training",
      description:
        "Fire safety training with two top tabs: the Jalsa module and a Fire Safety Order 2005 brief, plus a link to the full legal summary for Jalsa in the UK.",
    });
  }
  tabs.push({
    label: "Help",
    path: "/help",
    description: "What to do in a life-threatening emergency, site contact placeholders, and how this app fits in.",
  });
  return tabs;
}
