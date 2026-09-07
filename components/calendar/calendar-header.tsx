"use client";

import { addDays, addMonths, format, isSameDay, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/i18n/provider";

export type CalendarMode = "day" | "3days" | "week" | "month";

export function CalendarHeader({
  date,
  mode,
  onMode,
  onDate,
}: {
  date: Date;
  mode: CalendarMode;
  onMode: (mode: CalendarMode) => void;
  onDate: (date: Date) => void;
}) {
  const { t, dateLocale } = useI18n();
  const label =
    mode === "month" ? format(date, "LLLL yyyy", { locale: dateLocale }) : format(date, "d LLLL", { locale: dateLocale });

  const shift = (direction: -1 | 1) => {
    if (mode === "month") onDate(addMonths(date, direction));
    else if (mode === "week") onDate(addDays(date, 7 * direction));
    else if (mode === "3days") onDate(addDays(date, 3 * direction));
    else onDate(addDays(date, direction));
  };

  const modes: { id: CalendarMode; label: string }[] = [
    { id: "day", label: t.calendarDay },
    { id: "3days", label: t.calendar3days },
    { id: "week", label: t.calendarWeek },
    { id: "month", label: t.calendarMonth },
  ];

  return (
    <div className="px-4 pb-3">
      <div className="mb-3 flex items-center justify-between">
        <button aria-label={t.previous} className="flex h-10 w-10 items-center justify-center" onClick={() => shift(-1)}>
          <ChevronLeft />
        </button>
        <div className="text-center">
          <div className="text-lg font-semibold capitalize">{label}</div>
          {!isSameDay(date, new Date()) ? (
            <button className="text-sm text-[var(--tg-accent-text-color)]" onClick={() => onDate(new Date())}>
              {t.jumpToToday}
            </button>
          ) : null}
        </div>
        <button aria-label={t.next} className="flex h-10 w-10 items-center justify-center" onClick={() => shift(1)}>
          <ChevronRight />
        </button>
      </div>
      <div className="grid grid-cols-4 rounded-2xl bg-[var(--tg-section-bg-color)] p-1">
        {modes.map((item) => (
          <button
            key={item.id}
            onClick={() => onMode(item.id)}
            className={cn(
              "h-9 rounded-xl text-xs font-semibold",
              mode === item.id
                ? "bg-[var(--tg-button-color)] text-[var(--tg-button-text-color)]"
                : "text-[var(--tg-subtitle-text-color)]",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function weekStart(date: Date) {
  return startOfWeek(date, { weekStartsOn: 1 });
}
