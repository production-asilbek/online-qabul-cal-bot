"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { getCurrentUser } from "@/lib/services/businesses";
import { fullName } from "@/lib/utils/format";
import type { SessionUser } from "@/lib/auth/session";

function isDemoAccount(user: SessionUser | null) {
  return !user || user.id === "google-demo" || /^google(\s+user)?$/i.test(user.name);
}

export function googleGivenName(user: SessionUser | null, fallback: string) {
  if (isDemoAccount(user) || !user) return fallback;
  if (user.givenName?.trim()) return user.givenName.trim();
  return user.name.trim().split(/\s+/)[0] || fallback;
}

export function googleFullName(user: SessionUser | null, fallback: string) {
  if (isDemoAccount(user) || !user) return fallback;
  return user.name.trim() || fallback;
}

export function useGoogleAccount() {
  const { user } = useAuth();
  const mock = getCurrentUser();
  const fallbackFull = fullName(mock);
  return {
    givenName: googleGivenName(user, mock.firstName),
    fullName: googleFullName(user, fallbackFull),
  };
}
