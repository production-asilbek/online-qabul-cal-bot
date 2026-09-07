"use client";

import { ReactNode } from "react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/lib/hooks/use-store";
import { useTelegram } from "@/lib/hooks/use-telegram";
import { getCurrentBusiness } from "@/lib/services/businesses";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const HIDDEN_NAV = ["/onboarding", "/dev"];

export function AppShell({ children }: { children: ReactNode }) {
  const { ready } = useAppStore();
  useTelegram();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    const business = getCurrentBusiness();
    if (!business.onboardingComplete && pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [ready, pathname, router]);

  if (!ready) {
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
