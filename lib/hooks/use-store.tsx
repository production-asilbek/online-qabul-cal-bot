"use client";

import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { isDemoGoogleUser } from "@/lib/auth/identity";
import { useAuth } from "@/lib/hooks/use-auth";
import { mockStore } from "@/lib/mock/store";
import { applyGoogleProfile } from "@/lib/services/businesses";
import { processDueJobs } from "@/lib/services/reminders";

const StoreContext = createContext({ ready: false, version: 0 });

function subscribe(onChange: () => void) {
  return mockStore.subscribe(onChange);
}

function getClientSnapshot() {
  return mockStore.version;
}

function getServerSnapshot() {
  return 0;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user, ready: authReady } = useAuth();
  const version = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const accountId = user?.id ?? "anon";

  useEffect(() => {
    if (!authReady) return;
    mockStore.switchAccount(accountId, user ?? undefined);
    if (user && !isDemoGoogleUser(user)) {
      applyGoogleProfile(user.name);
    }
  }, [authReady, accountId, user]);

  const ready = authReady && mockStore.isHydrated && mockStore.currentAccountId === accountId;

  useEffect(() => {
    if (!ready || !user) return;
    void processDueJobs();
  }, [ready, user]);

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
