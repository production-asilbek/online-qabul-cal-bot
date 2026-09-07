import type { TelegramThemeParams, TelegramUser, TelegramWebApp } from "./types";

const DEV_USER_ID = Number(process.env.NEXT_PUBLIC_DEV_USER_ID ?? "123456789");

const DEV_USER: TelegramUser = {
  id: DEV_USER_ID,
  first_name: "Asilbek",
  last_name: "Owner",
  username: "asilbek",
  language_code: "en",
};

export function isTelegramWebApp() {
  if (typeof window === "undefined") return false;
  return Boolean(window.Telegram?.WebApp?.initData);
}

export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === "undefined") return null;
  return window.Telegram?.WebApp ?? null;
}

export function getTelegramUser(): TelegramUser {
  const webApp = getTelegramWebApp();
  return webApp?.initDataUnsafe?.user ?? DEV_USER;
}

export function getTelegramTheme(): TelegramThemeParams {
  return getTelegramWebApp()?.themeParams ?? {};
}

export function initTelegram() {
  const webApp = getTelegramWebApp();
  if (!webApp) return null;
  webApp.ready();
  webApp.expand();
  return webApp;
}

export function haptic(style: "light" | "medium" | "heavy" | "success" | "error" | "warning" = "light") {
  if (!isTelegramWebApp()) return;
  const feedback = getTelegramWebApp()?.HapticFeedback;
  if (!feedback) return;
  if (style === "success" || style === "error" || style === "warning") {
    feedback.notificationOccurred(style);
    return;
  }
  feedback.impactOccurred(style);
}

export function applyTelegramTheme(theme: TelegramThemeParams, colorScheme: "light" | "dark" = "light") {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.theme = colorScheme;

  const fallback = colorScheme === "dark" ? DARK_FALLBACK : LIGHT_FALLBACK;
  const merged = { ...fallback, ...compact(theme) };

  root.style.setProperty("--tg-bg-color", merged.bg_color);
  root.style.setProperty("--tg-text-color", merged.text_color);
  root.style.setProperty("--tg-hint-color", merged.hint_color);
  root.style.setProperty("--tg-link-color", merged.link_color);
  root.style.setProperty("--tg-button-color", merged.button_color);
  root.style.setProperty("--tg-button-text-color", merged.button_text_color);
  root.style.setProperty("--tg-secondary-bg-color", merged.secondary_bg_color);
  root.style.setProperty("--tg-header-bg-color", merged.header_bg_color);
  root.style.setProperty("--tg-accent-text-color", merged.accent_text_color);
  root.style.setProperty("--tg-section-bg-color", merged.section_bg_color);
  root.style.setProperty("--tg-section-header-text-color", merged.section_header_text_color);
  root.style.setProperty("--tg-subtitle-text-color", merged.subtitle_text_color);
  root.style.setProperty("--tg-destructive-text-color", merged.destructive_text_color);
  root.style.setProperty("--tg-bottom-bar-bg-color", merged.bottom_bar_bg_color);
}

const LIGHT_FALLBACK: Required<TelegramThemeParams> = {
  bg_color: "#F2F2F7",
  text_color: "#111827",
  hint_color: "#8E8E93",
  link_color: "#187ACC",
  button_color: "#187ACC",
  button_text_color: "#FFFFFF",
  secondary_bg_color: "#FFFFFF",
  header_bg_color: "#F2F2F7",
  accent_text_color: "#187ACC",
  section_bg_color: "#FFFFFF",
  section_header_text_color: "#6B7280",
  subtitle_text_color: "#6B7280",
  destructive_text_color: "#E53935",
  bottom_bar_bg_color: "#FFFFFF",
};

const DARK_FALLBACK: Required<TelegramThemeParams> = {
  bg_color: "#0E0E10",
  text_color: "#F5F5F7",
  hint_color: "#8E8E93",
  link_color: "#5EB1F5",
  button_color: "#2F8FDB",
  button_text_color: "#FFFFFF",
  secondary_bg_color: "#1C1C1E",
  header_bg_color: "#0E0E10",
  accent_text_color: "#5EB1F5",
  section_bg_color: "#1C1C1E",
  section_header_text_color: "#A1A1AA",
  subtitle_text_color: "#A1A1AA",
  destructive_text_color: "#FF6B6B",
  bottom_bar_bg_color: "#1C1C1E",
};

function compact<T extends object>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => Boolean(item)),
  ) as Partial<T>;
}
