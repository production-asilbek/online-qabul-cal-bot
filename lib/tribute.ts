import { getTelegramWebApp, haptic, isTelegramWebApp } from "@/lib/telegram";

export const TRIBUTE_TELEGRAM_URL =
  process.env.NEXT_PUBLIC_TRIBUTE_URL || "https://t.me/tribute/app?startapp=dQ45";

export const TRIBUTE_WEB_URL =
  process.env.NEXT_PUBLIC_TRIBUTE_WEB_URL || "https://web.tribute.tg/d/Q45";

export function tributePaymentUrl() {
  return isTelegramWebApp() ? TRIBUTE_TELEGRAM_URL : TRIBUTE_WEB_URL;
}

function telegramVersion() {
  return Number.parseFloat(getTelegramWebApp()?.version ?? "0");
}

export function openTributePayment() {
  const url = tributePaymentUrl();

  if (isTelegramWebApp()) {
    try {
      haptic("medium");
      const webApp = getTelegramWebApp();
      if (webApp && telegramVersion() >= 6.4 && typeof webApp.openTelegramLink === "function") {
        webApp.openTelegramLink(url);
        return;
      }
    } catch {
      // Fall back to a full navigation.
    }
  }

  if (typeof window !== "undefined") {
    window.location.assign(url);
  }
}
