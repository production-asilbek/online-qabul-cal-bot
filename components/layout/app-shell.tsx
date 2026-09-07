"use client";

import { ReactNode, useEffect } from "react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/lib/hooks/use-store";
import { useAuth } from "@/lib/hooks/use-auth";
import { useTelegram } from "@/lib/hooks/use-telegram";
import { isRegistrationComplete } from "@/lib/auth/registration";
import { usePathname, useRouter } from "next/navigation";

const HIDDEN_NAV = ["/onboarding", "/register", "/dev"];

export function AppShell({ children }: { children: ReactNode }) {
  const { ready } = useAppStore();
  const { user, ready: authReady } = useAuth();
  useTelegram();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!ready || !authReady) return;
    const onRegister = pathname.startsWith("/register");
    const registered = isRegistrationComplete(user?.id);
    if (!user && !onRegister) {
      router.replace("/register");
      return;
    }
    if (user && !registered && !onRegister) {
      router.replace("/register");
      return;
    }
    if (user && registered && onRegister) {
      router.replace("/");
    }
  }, [ready, authReady, user, pathname, router]);

  if (!ready || !authReady) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-lg flex-col gap-4 px-5 pt-16">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  const showNav = !HIDDEN_NAV.some((path) => pathname.startsWith(path));

  return (
    <div className="mx-auto min-h-dvh w-full max-w-lg">
      <div className={showNav ? "pb-[calc(72px+env(safe-area-inset-bottom))]" : ""}>{children}</div>
      {showNav ? <BottomNav /> : null}
    </div>
  );
}
