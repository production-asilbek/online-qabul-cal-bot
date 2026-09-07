"use client";

import { useI18n } from "@/lib/i18n/provider";
import type { Locale } from "@/lib/i18n/messages";
import { cn } from "@/lib/utils/cn";
import { haptic } from "@/lib/telegram";

export function LanguageSwitcher({
  compact = false,
  value,
  onChange,
}: {
  compact?: boolean;
  value?: Locale;
  onChange?: (locale: Locale) => void;
}) {
  const { locale, setLocale, t } = useI18n();
  const current = value ?? locale;

  const pick = (next: Locale) => {
    haptic("light");
    setLocale(next);
    onChange?.(next);
  };

  return (
    <div className={compact ? "" : "mx-4 mt-5 overflow-hidden rounded-[18px] bg-[var(--tg-section-bg-color)] p-4"}>
      {compact ? null : <p className="mb-3 text-sm font-semibold">{t.language}</p>}
      <div className="grid grid-cols-3 gap-2">
        {([
          ["uz", t.uzbek],
          ["ru", t.russian],
          ["en", t.english],
        ] as const).map(([code, label]) => (
          <button
            key={code}
            type="button"
            onClick={() => pick(code)}
            className={cn(
              "h-11 rounded-2xl px-2 text-sm font-semibold",
              current === code
                ? "bg-[var(--tg-button-color)] text-[var(--tg-button-text-color)]"
                : "bg-[var(--tg-bg-color)]",
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
