import { parseISO } from "date-fns";
import type { WorkingHours } from "@/types";
import { minutesToTime, parseTimeToMinutes } from "@/lib/utils/date";

export function hoursForDate(hours: WorkingHours[], date: Date) {
  return hours.find((item) => item.weekday === date.getDay());
}

export function buildTimeSlots(hours: WorkingHours | undefined, stepMin = 30) {
  if (!hours || hours.isClosed || hours.ranges.length === 0) return [];
  const slots: string[] = [];
  for (const range of hours.ranges) {
    let current = parseTimeToMinutes(range.start);
    const end = parseTimeToMinutes(range.end);
    while (current < end) {
      const time = minutesToTime(current);
      const inBreak = hours.breaks.some((item) => {
        const start = parseTimeToMinutes(item.start);
        const stop = parseTimeToMinutes(item.end);
        return current >= start && current < stop;
      });
      if (!inBreak) slots.push(time);
      current += stepMin;
    }
  }
  return slots;
}

export function appointmentOverlaps(startAt: string, endAt: string, slot: string, date: Date) {
  const start = parseISO(startAt);
  const end = parseISO(endAt);
  if (start.toDateString() !== date.toDateString()) return false;
  const slotMinutes = parseTimeToMinutes(slot);
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();
  return slotMinutes >= startMinutes && slotMinutes < endMinutes;
}
