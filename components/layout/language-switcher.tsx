"use client";

import { useI18n } from "@/lib/i18n/provider";
import type { Locale } from "@/lib/i18n/messages";
import { cn } from "@/lib/utils/cn";
import { haptic } from "@/lib/telegram";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  const pick = (next: Locale) => {
    haptic("light");
    setLocale(next);
  };

  return (
    <div className="mx-4 mt-5 overflow-hidden rounded-[18px] bg-[var(--tg-section-bg-color)] p-4">
      <p className="mb-3 text-sm font-semibold">{t.language}</p>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => pick("uz")}
          className={cn(
            "h-11 rounded-2xl text-sm font-semibold",
            locale === "uz"
              ? "bg-[var(--tg-button-color)] text-[var(--tg-button-text-color)]"
              : "bg-[var(--tg-bg-color)]",
          )}
        >
          {t.uzbek}
        </button>
        <button
          type="button"
          onClick={() => pick("ru")}
          className={cn(
            "h-11 rounded-2xl text-sm font-semibold",
            locale === "ru"
              ? "bg-[var(--tg-button-color)] text-[var(--tg-button-text-color)]"
              : "bg-[var(--tg-bg-color)]",
          )}
        >
          {t.russian}
        </button>
      </div>
    </div>
  );
}
