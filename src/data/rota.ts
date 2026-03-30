export type RotaEntry = {
  time: string;
  people: string;
  notes?: string;
};

export type RotaDay = {
  label: string;
  dateIso: string;
  entries: RotaEntry[];
};

export const rotaDays: RotaDay[] = [
  {
    label: "Friday",
    dateIso: "2026-07-24",
    entries: [
      {
        time: "07:00–12:00",
        people: "Person A, Person B",
        notes: "Site opening and morning coverage",
      },
      {
        time: "12:00–18:00",
        people: "Person B, Person C",
        notes: "Afternoon peak",
      },
      {
        time: "18:00–22:00",
        people: "Person A, Person C",
        notes: "Evening wind-down",
      },
    ],
  },
  {
    label: "Saturday",
    dateIso: "2026-07-25",
    entries: [
      {
        time: "07:00–12:00",
        people: "Person C, Person A",
        notes: "Main day — first shift",
      },
      {
        time: "12:00–18:00",
        people: "Person A, Person B",
        notes: "Main day — middle shift",
      },
      {
        time: "18:00–22:00",
        people: "Person B, Person C",
        notes: "Evening",
      },
    ],
  },
  {
    label: "Sunday",
    dateIso: "2026-07-26",
    entries: [
      {
        time: "07:00–12:00",
        people: "Person B, Person A",
        notes: "Final day — morning",
      },
      {
        time: "12:00–18:00",
        people: "Person C, Person B",
        notes: "Final day — afternoon",
      },
      {
        time: "18:00–21:00",
        people: "Person A, Person C",
        notes: "Site close support",
      },
    ],
  },
];
