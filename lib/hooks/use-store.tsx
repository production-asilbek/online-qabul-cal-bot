"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { mockStore } from "@/lib/mock/store";
import { processDueJobs } from "@/lib/services/reminders";

const StoreContext = createContext({ ready: false, version: 0 });

function subscribe(onChange: () => void) {
  return mockStore.subscribe(onChange);
}

function getClientSnapshot() {
  if (!mockStore.isHydrated) mockStore.hydrate();
  return mockStore.version;
}

function getServerSnapshot() {
  return 0;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const version = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const ready = version > 0;

  useEffect(() => {
    if (!ready) return;
    void processDueJobs();
  }, [ready]);

  const value = useMemo(() => ({ ready, version }), [ready, version]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore() {
  return useContext(StoreContext);
}

export function useDebouncedValue<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
