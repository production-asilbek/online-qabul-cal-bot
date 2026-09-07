"use client";

import { addDays, addMonths, startOfDay } from "date-fns";
import { useMemo, useState } from "react";
import { CalendarHeader, weekStart, type CalendarMode } from "@/components/calendar/calendar-header";
import { DayView, MonthView, MultiDayView } from "@/components/calendar/calendar-views";
import { useAppStore } from "@/lib/hooks/use-store";
import { getAppointments, hydrateAppointments } from "@/lib/services/appointments";
import { getWorkingHours } from "@/lib/services/businesses";

export default function CalendarPage() {
  useAppStore();
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState<CalendarMode>("day");
  const hours = getWorkingHours();

  const range = useMemo(() => {
    if (mode === "month") {
      const start = startOfDay(new Date(date.getFullYear(), date.getMonth(), 1));
      return { start, end: addMonths(start, 1) };
    }
    if (mode === "week") {
      const start = weekStart(date);
      return { start, end: addDays(start, 7) };
    }
    if (mode === "3days") {
      const start = startOfDay(date);
      return { start, end: addDays(start, 3) };
    }
    const start = startOfDay(date);
    return { start, end: addDays(start, 1) };
  }, [date, mode]);

  const appointments = hydrateAppointments(getAppointments(range.start, range.end));

  return (
    <main className="pt-4">
      <CalendarHeader date={date} mode={mode} onMode={setMode} onDate={setDate} />
      {mode === "day" ? (
        <DayView
          date={date}
          appointments={appointments}
          hours={hours}
          onSwipe={(direction) => setDate(addDays(date, direction))}
        />
      ) : null}
      {mode === "3days" ? <MultiDayView start={date} days={3} appointments={appointments} /> : null}
      {mode === "week" ? <MultiDayView start={weekStart(date)} days={7} appointments={appointments} /> : null}
      {mode === "month" ? (
        <MonthView month={date} selected={date} appointments={appointments} onSelect={setDate} />
      ) : null}
    </main>
  );
}
