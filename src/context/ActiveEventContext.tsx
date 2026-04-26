/* eslint-disable react-refresh/only-export-components -- file exports both Provider and useActiveEvent hook */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "../auth/useAuth";
import {
  ADMIN_EVENT_SELECTOR_IDS,
  getActiveEventId,
  getEventById,
  type EventDefinition,
  USER_FIXED_EVENT_ID,
} from "../data/events";

const STORAGE_KEY = "fire-safety-admin-selected-event-v1";

function resolveAdminInitialSelection(): string {
  if (typeof localStorage === "undefined") {
    return getActiveEventId();
  }
  const stored = localStorage.getItem(STORAGE_KEY)?.trim();
  if (stored && (ADMIN_EVENT_SELECTOR_IDS as readonly string[]).includes(stored)) {
    return stored;
  }
  const envId = getActiveEventId();
  if ((ADMIN_EVENT_SELECTOR_IDS as readonly string[]).includes(envId)) {
    return envId;
  }
  return USER_FIXED_EVENT_ID;
}

type Ctx = {
  event: EventDefinition;
  /** Event id the UI is scoped to (admin choice or fixed 2026 for user). */
  eventId: string;
  canSelectEvent: boolean;
  setEventId: (id: string) => void;
  /** Options shown in the admin selector (Jalsa 2026 / 2025). */
  adminEventOptions: readonly EventDefinition[];
};

const ActiveEventContext = createContext<Ctx | null>(null);

export function ActiveEventProvider({ children }: { children: ReactNode }) {
  const { role, ready } = useAuth();
  const [adminEventId, setAdminEventId] = useState<string>(resolveAdminInitialSelection);

  const adminEventOptions = useMemo(
    () =>
      ADMIN_EVENT_SELECTOR_IDS.map((id) => getEventById(id)).filter(
        (e): e is EventDefinition => e != null,
      ),
    [],
  );

  const { event, eventId, canSelectEvent } = useMemo(() => {
    if (!ready || !role) {
      const e = getEventById(USER_FIXED_EVENT_ID)!;
      return { event: e, eventId: USER_FIXED_EVENT_ID, canSelectEvent: false };
    }
    if (role === "user") {
      const e = getEventById(USER_FIXED_EVENT_ID)!;
      return { event: e, eventId: USER_FIXED_EVENT_ID, canSelectEvent: false };
    }
    const id = (ADMIN_EVENT_SELECTOR_IDS as readonly string[]).includes(adminEventId)
      ? adminEventId
      : USER_FIXED_EVENT_ID;
    return {
      event: getEventById(id) ?? getEventById(USER_FIXED_EVENT_ID)!,
      eventId: id,
      canSelectEvent: true,
    };
  }, [ready, role, adminEventId]);

  const setEventId = useCallback(
    (id: string) => {
      if (role !== "admin") return;
      if (!(ADMIN_EVENT_SELECTOR_IDS as readonly string[]).includes(id)) return;
      setAdminEventId(id);
      try {
        localStorage.setItem(STORAGE_KEY, id);
      } catch {
        /* ignore */
      }
    },
    [role],
  );

  const value = useMemo(
    () => ({
      event,
      eventId,
      canSelectEvent,
      setEventId,
      adminEventOptions,
    }),
    [event, eventId, canSelectEvent, setEventId, adminEventOptions],
  );

  return (
    <ActiveEventContext.Provider value={value}>{children}</ActiveEventContext.Provider>
  );
}

export function useActiveEvent(): Ctx {
  const v = useContext(ActiveEventContext);
  if (!v) {
    throw new Error("useActiveEvent must be used under ActiveEventProvider");
  }
  return v;
}
