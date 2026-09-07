"use client";

import { useState } from "react";
import { ScreenHeader } from "@/components/layout/screen-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAppStore } from "@/lib/hooks/use-store";
import { getWorkingHours, updateWorkingHours } from "@/lib/services/businesses";
import { haptic } from "@/lib/telegram";
import { useI18n, weekdayName } from "@/lib/i18n/provider";
import type { WorkingHours } from "@/types";

export default function HoursPage() {
  useAppStore();
  const { t } = useI18n();
  const initial = getWorkingHours();
  const [hours, setHours] = useState<WorkingHours[]>(
    [0, 1, 2, 3, 4, 5, 6].map((weekday) => initial.find((item) => item.weekday === weekday) ?? {
      id: `wh_${weekday}`,
      businessId: "",
      weekday,
      isClosed: weekday === 0,
      ranges: weekday === 0 ? [] : weekday === 6 ? [{ start: "10:00", end: "15:00" }] : [{ start: "09:00", end: "18:00" }],
      breaks: weekday === 0 || weekday === 6 ? [] : [{ start: "13:00", end: "14:00" }],
    }),
  );

  return (
    <main className="pb-8">
      <ScreenHeader title={t.workingHours} backHref="/settings" />
      <div className="flex flex-col gap-3 px-4">
        {hours
          .slice(1)
          .concat(hours[0])
          .map((day) => (
            <Card key={day.weekday}>
              <div className="mb-3 flex items-center justify-between">
                <div className="font-semibold">{weekdayName(t, day.weekday)}</div>
                <label className="text-sm">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={!day.isClosed}
                    onChange={(event) => {
                      setHours((current) =>
                        current.map((item) =>
                          item.weekday === day.weekday
                            ? { ...item, isClosed: !event.target.checked, ranges: event.target.checked ? item.ranges.length ? item.ranges : [{ start: "09:00", end: "18:00" }] : [] }
                            : item,
                        ),
                      );
                    }}
                  />
                  {t.open}
                </label>
              </div>
              {day.isClosed ? (
                <p className="text-sm text-[var(--tg-hint-color)]">{t.closed}</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="time"
                    className="select-field"
                    value={day.ranges[0]?.start ?? "09:00"}
                    onChange={(event) =>
                      setHours((current) =>
                        current.map((item) =>
                          item.weekday === day.weekday
                            ? { ...item, ranges: [{ start: event.target.value, end: item.ranges[0]?.end ?? "18:00" }] }
                            : item,
                        ),
                      )
                    }
                  />
                  <input
                    type="time"
                    className="select-field"
                    value={day.ranges[0]?.end ?? "18:00"}
                    onChange={(event) =>
                      setHours((current) =>
                        current.map((item) =>
                          item.weekday === day.weekday
                            ? { ...item, ranges: [{ start: item.ranges[0]?.start ?? "09:00", end: event.target.value }] }
                            : item,
                        ),
                      )
                    }
                  />
                </div>
              )}
            </Card>
          ))}
        <Button
          onClick={() => {
            updateWorkingHours(hours);
            haptic("success");
          }}
        >
          {t.saveHours}
        </Button>
      </div>
    </main>
  );
}
