"use client";

import { useSyncExternalStore } from "react";
import {
  applyTelegramTheme,
  getTelegramUser,
  getTelegramWebApp,
  initTelegram,
  isTelegramWebApp,
} from "@/lib/telegram";
import type { TelegramUser } from "@/lib/telegram";

let cachedUser: TelegramUser | null = null;
let cachedInside = false;
let telegramBootstrapped = false;

function bootstrapTelegram() {
  if (telegramBootstrapped || typeof window === "undefined") return;
  const webApp = initTelegram() ?? getTelegramWebApp();
  applyTelegramTheme(webApp?.themeParams ?? {}, webApp?.colorScheme ?? "light");
  cachedUser = getTelegramUser();
  cachedInside = isTelegramWebApp();
  telegramBootstrapped = true;
}

function subscribe(onChange: () => void) {
  bootstrapTelegram();
  const webApp = getTelegramWebApp();
  const onTheme = () => {
    applyTelegramTheme(webApp?.themeParams ?? {}, webApp?.colorScheme ?? "light");
    cachedUser = getTelegramUser();
    onChange();
  };
  webApp?.onEvent("themeChanged", onTheme);
  return () => webApp?.offEvent("themeChanged", onTheme);
}

function getClientSnapshot() {
  bootstrapTelegram();
  return `${cachedUser?.id ?? 0}:${cachedInside ? 1 : 0}`;
}

function getServerSnapshot() {
  return "0:0";
}

export function useTelegram() {
  const snapshot = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const insideTelegram = snapshot.endsWith(":1");
  return {
    user: cachedUser,
    insideTelegram,
    webApp: getTelegramWebApp(),
  };
}
