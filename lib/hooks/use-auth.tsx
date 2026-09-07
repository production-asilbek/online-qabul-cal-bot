"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { applyGoogleProfile } from "@/lib/services/businesses";
import type { SessionUser } from "@/lib/auth/session";

const AuthContext = createContext<{
  user: SessionUser | null;
  ready: boolean;
  refresh: () => Promise<void>;
}>({
  user: null,
  ready: false,
  refresh: async () => undefined,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/auth/me", { cache: "no-store" });
    const json = (await response.json()) as { user: SessionUser | null };
    setUser(json.user);
    if (json.user && json.user.id !== "google-demo") {
      applyGoogleProfile(json.user.name);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(() => ({ user, ready, refresh }), [user, ready, refresh]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
