"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { getCurrentUser } from "@/lib/services/businesses";
import { fullName } from "@/lib/utils/format";
import { isDemoGoogleUser, isPlaceholderGoogleName } from "@/lib/auth/identity";
import type { SessionUser } from "@/lib/auth/session";

export function googleGivenName(user: SessionUser | null, fallback: string) {
  if (isDemoGoogleUser(user) || !user) return fallback;
  const given = user.givenName?.trim();
  if (given && !isPlaceholderGoogleName(given)) return given;
  const first = user.name.trim().split(/\s+/)[0] || fallback;
  return isPlaceholderGoogleName(first) ? fallback : first;
}

export function googleFullName(user: SessionUser | null, fallback: string) {
  if (isDemoGoogleUser(user) || !user) return fallback;
  const name = user.name.trim();
  return !name || isPlaceholderGoogleName(name) ? fallback : name;
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
