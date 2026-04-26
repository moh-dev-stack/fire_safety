export type VenueAreaId = "kitchen" | "car_park" | "langar";

export type VenueChecklistItem = {
  id: string;
  area: VenueAreaId;
  /** Stable heading for grouping in UI */
  areaTitle: string;
  label: string;
};

/** Checklist lines - Kitchen, Car park, and Langar each have their own tasks (confirm wording with PM / H&S). */
export const VENUE_CHECKLIST_ITEMS: readonly VenueChecklistItem[] = [
  // Kitchen (prep / equipment / grease)
  {
    id: "kitchen-gas",
    area: "kitchen",
    areaTitle: "Kitchen",
    label:
      "Gas / LPG isolations and checks documented; catering leads confirm safe startup and shutdown where applicable.",
  },
  {
    id: "kitchen-grease",
    area: "kitchen",
    areaTitle: "Kitchen",
    label:
      "Cooking oil and grease management per H&S; Class F awareness and correct extinguishers for fryers.",
  },
  {
    id: "kitchen-extinguishers",
    area: "kitchen",
    areaTitle: "Kitchen",
    label: "Kitchen-area extinguishers in date, visible, and access paths kept clear.",
  },
  {
    id: "kitchen-extract",
    area: "kitchen",
    areaTitle: "Kitchen",
    label: "Extraction / ventilation checked per catering lead; any faults reported to duty fire & safety.",
  },
  // Car park
  {
    id: "cp-access",
    area: "car_park",
    areaTitle: "Car park",
    label: "Emergency vehicle routes and main gates clear; marshals briefed on holding and reopening.",
  },
  {
    id: "cp-signage",
    area: "car_park",
    areaTitle: "Car park",
    label: "Fire and assembly signage visible from main vehicle and pedestrian approaches.",
  },
  {
    id: "cp-pedestrian",
    area: "car_park",
    areaTitle: "Car park",
    label: "Pedestrian crossings and conflict points reasonably safe; obvious trip or crowding issues flagged.",
  },
  // Langar (serving / marquee flow - distinct from back kitchen prep)
  {
    id: "langar-exits",
    area: "langar",
    areaTitle: "Langar",
    label: "Serving and dining exits unobstructed; exit signs lit or clearly visible in the langar zone.",
  },
  {
    id: "langar-extinguishers",
    area: "langar",
    areaTitle: "Langar",
    label: "Extinguishers near langar / serving area in date, visible, paths clear.",
  },
  {
    id: "langar-cables",
    area: "langar",
    areaTitle: "Langar",
    label: "Temporary power and cable runs tidy; trip hazards reported to duty officer.",
  },
  {
    id: "langar-evac",
    area: "langar",
    areaTitle: "Langar",
    label: "Staff on duty know evacuation direction from the langar area to the assembly point.",
  },
] as const;

/** Section order in the form and in history summaries. */
export const VENUE_AREA_ORDER: readonly VenueAreaId[] = ["kitchen", "car_park", "langar"];

/** Venues available in “Select venue” - aligns with checklist areas. */
export const VENUE_OPTIONS: readonly { id: VenueAreaId; label: string }[] = [
  { id: "kitchen", label: "Kitchen" },
  { id: "car_park", label: "Car park" },
  { id: "langar", label: "Langar" },
];

export function itemsForVenue(venueId: VenueAreaId): readonly VenueChecklistItem[] {
  return VENUE_CHECKLIST_ITEMS.filter((i) => i.area === venueId);
}

export function venueDisplayLabel(venueId: VenueAreaId): string {
  return VENUE_OPTIONS.find((v) => v.id === venueId)?.label ?? venueId;
}

/** One-line scope for each venue - shown under the checklist heading so the list is clearly venue-specific. */
export const VENUE_CHECKLIST_SCOPE: Record<VenueAreaId, string> = {
  kitchen:
    "Back-of-house: gas/LPG, grease and Class F, kitchen extinguishers, and extraction.",
  car_park:
    "Parking field: emergency routes, fire/assembly signage, and pedestrian safety.",
  langar:
    "Langar/serving zone: exits, extinguishers, temporary power, and evacuation awareness.",
};
