import {
  ENABLE_TRAINING_MODULE,
  ENABLE_VENUE_CHECKLIST,
} from "../config/features";

export type HomeTabInfo = {
  label: string;
  path: string;
  description: string;
  /** Optional shortcuts shown under the same list item (e.g. Team sub-sections). */
  relatedLinks?: readonly { label: string; path: string }[];
};

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
      description:
        "The team area has three sub-tabs: Overview (who is on the fire and safety team, layers of responsibility, how to find people on shift), Roles (short descriptions of on-site fire and safety roles), and Rota (who is on duty and when, by day and shift).",
      relatedLinks: [
        { label: "Roles", path: "/team/roles" },
        { label: "Rota", path: "/team/rota" },
      ],
    },
  ];
  if (ENABLE_TRAINING_MODULE) {
    tabs.push({
      label: "Training",
      path: "/training",
      description:
        "Fire safety training: Jalsa module, Fire Safety Order 2005 tab, and full FSO (UK) page.",
    });
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
      description:
        "Submit a new incident and (for leads) open the log of past reports. Use the Report and Log sub-tabs at the top of this section.",
      relatedLinks: [{ label: "Log", path: "/incidents/log" }],
    },
    {
      label: "Map",
      path: "/map",
      description: "Map of the Jalsa site (Islamabad, UK) for orientation and when giving directions over the radio.",
    },
  );
  return tabs;
}

export function getUserHomeTabs(): HomeTabInfo[] {
  const tabs: HomeTabInfo[] = [
    {
      label: "Home",
      path: "/",
      description: "This screen: what each tab in your menu is for. You have a cut-down set of pages (report and training).",
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
        "Fire safety training: module, FSO brief tab, and link to the full legal summary for Jalsa in the UK.",
    });
  }
  return tabs;
}
