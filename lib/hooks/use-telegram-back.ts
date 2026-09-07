"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getTelegramWebApp, isTelegramWebApp } from "@/lib/telegram";

export function useTelegramBack(enabled = true) {
  const router = useRouter();

  useEffect(() => {
    if (!isTelegramWebApp()) return;
    const back = getTelegramWebApp()?.BackButton;
    if (!back || !enabled) return;

    const onClick = () => router.back();
    back.show();
    back.onClick(onClick);
    return () => {
      back.offClick(onClick);
      back.hide();
    };
  }, [enabled, router]);
}
