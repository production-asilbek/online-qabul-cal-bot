"use client";

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { ru as ruDate, uz as uzDate } from "date-fns/locale";
import type { Locale as DateLocale } from "date-fns";
import { dictionaries, type Locale, type Messages } from "./messages";
import { getTelegramUser } from "@/lib/telegram";

const STORAGE_KEY = "stom-lang";

let currentLocale: Locale = "uz";
const listeners = new Set<() => void>();

function detectLocale(): Locale {
  if (typeof window === "undefined") return "uz";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "uz" || saved === "ru") return saved;
  const code = getTelegramUser().language_code ?? navigator.language;
  if (code.toLowerCase().startsWith("ru")) return "ru";
  return "uz";
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

function getSnapshot() {
  if (typeof window !== "undefined") {
    currentLocale = detectLocale();
  }
  return currentLocale;
}

function getServerSnapshot(): Locale {
  return "uz";
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function setLocale(locale: Locale) {
  currentLocale = locale;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }
  emit();
}

const I18nContext = createContext({
  locale: "uz" as Locale,
  t: dictionaries.uz,
  setLocale,
  dateLocale: uzDate as DateLocale,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const value = useMemo(
    () => ({
      locale,
      t: dictionaries[locale],
      setLocale,
      dateLocale: locale === "ru" ? ruDate : uzDate,
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

export function interpolate(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ""));
}

export function statusLabel(t: Messages, status: string) {
  const map: Record<string, keyof Messages> = {
    scheduled: "statusScheduled",
    confirmed: "statusConfirmed",
    arrived: "statusArrived",
    completed: "statusCompleted",
    cancelled: "statusCancelled",
    no_show: "statusNoShow",
  };
  return t[map[status] ?? "statusScheduled"];
}

export function businessTypeLabel(t: Messages, type: string) {
  const map: Record<string, keyof Messages> = {
    clinic: "typeClinic",
    dental: "typeDental",
    beauty: "typeBeauty",
    barber: "typeBarber",
    fitness: "typeFitness",
    massage: "typeMassage",
    repair: "typeRepair",
    other: "typeOther",
  };
  return t[map[type] ?? "typeOther"];
}
