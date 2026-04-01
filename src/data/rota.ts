export type RotaEntry = {
  time: string;
  people: string;
  notes?: string;
};

export type RotaDay = {
  label: string;
  dateIso: string;
  /** Two day shifts per calendar day (e.g. morning / afternoon). */
  dayShifts: readonly RotaEntry[];
  /** Two night shifts per calendar day (e.g. evening–late / late–morning). */
  nightShifts: readonly RotaEntry[];
};

export const rotaDays: readonly RotaDay[] = [
  {
    label: "Friday",
    dateIso: "2026-07-24",
    dayShifts: [
      {
        time: "08:00–14:00",
        people: "Person A, Person B",
        notes: "Day shift 1 — site opening and morning coverage",
      },
      {
        time: "14:00–20:00",
        people: "Person B, Person C",
        notes: "Day shift 2 — afternoon peak",
      },
    ],
    nightShifts: [
      {
        time: "20:00–02:00",
        people: "Person C, Person A",
        notes: "Night shift 1 — evening handover and late site",
      },
      {
        time: "02:00–08:00",
        people: "Person A, Person B",
        notes: "Night shift 2 — early hours (into Saturday morning)",
      },
    ],
  },
  {
    label: "Saturday",
    dateIso: "2026-07-25",
    dayShifts: [
      {
        time: "08:00–14:00",
        people: "Person C, Person A",
        notes: "Day shift 1 — main Jalsa day",
      },
      {
        time: "14:00–20:00",
        people: "Person A, Person B",
        notes: "Day shift 2 — afternoon / evening transition",
      },
    ],
    nightShifts: [
      {
        time: "20:00–02:00",
        people: "Person B, Person C",
        notes: "Night shift 1",
      },
      {
        time: "02:00–08:00",
        people: "Person C, Person A",
        notes: "Night shift 2 — early hours (into Sunday morning)",
      },
    ],
  },
  {
    label: "Sunday",
    dateIso: "2026-07-26",
    dayShifts: [
      {
        time: "08:00–14:00",
        people: "Person B, Person A",
        notes: "Day shift 1 — final day morning",
      },
      {
        time: "14:00–20:00",
        people: "Person C, Person B",
        notes: "Day shift 2 — wind-down and departures",
      },
    ],
    nightShifts: [
      {
        time: "20:00–23:00",
        people: "Person A, Person C",
        notes: "Night shift 1 — site close support (shortened)",
      },
      {
        time: "23:00–02:00",
        people: "Person A, Person B",
        notes: "Night shift 2 — lock-up / security (where applicable)",
      },
    ],
  },
];
