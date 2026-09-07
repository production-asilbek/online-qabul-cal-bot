"use client";

import { addDays, addMonths, format, isSameDay, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

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
  const label =
    mode === "month" ? format(date, "MMMM yyyy") : format(date, "MMMM d");

  const shift = (direction: -1 | 1) => {
    if (mode === "month") onDate(addMonths(date, direction));
    else if (mode === "week") onDate(addDays(date, 7 * direction));
    else if (mode === "3days") onDate(addDays(date, 3 * direction));
    else onDate(addDays(date, direction));
  };

  return (
    <div className="px-4 pb-3">
      <div className="mb-3 flex items-center justify-between">
        <button aria-label="Previous" className="flex h-10 w-10 items-center justify-center" onClick={() => shift(-1)}>
          <ChevronLeft />
        </button>
        <div className="text-center">
          <div className="text-lg font-semibold">{label}</div>
          {!isSameDay(date, new Date()) ? (
            <button className="text-sm text-[var(--tg-accent-text-color)]" onClick={() => onDate(new Date())}>
              Jump to today
            </button>
          ) : null}
        </div>
        <button aria-label="Next" className="flex h-10 w-10 items-center justify-center" onClick={() => shift(1)}>
          <ChevronRight />
        </button>
      </div>
      <div className="grid grid-cols-4 rounded-2xl bg-[var(--tg-section-bg-color)] p-1">
        {(["day", "3days", "week", "month"] as CalendarMode[]).map((item) => (
          <button
            key={item}
            onClick={() => onMode(item)}
            className={cn(
              "h-9 rounded-xl text-xs font-semibold capitalize",
              mode === item
                ? "bg-[var(--tg-button-color)] text-[var(--tg-button-text-color)]"
                : "text-[var(--tg-subtitle-text-color)]",
            )}
          >
            {item === "3days" ? "3 days" : item}
          </button>
        ))}
      </div>
    </div>
  );
}

export function weekStart(date: Date) {
  return startOfWeek(date, { weekStartsOn: 1 });
}
