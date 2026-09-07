import {
  addMinutes,
  format,
  isSameDay,
  parseISO,
  startOfDay,
  startOfWeek,
  type Locale,
} from "date-fns";

export const TIMEZONE = "Asia/Tashkent";

export function greetingForHour(
  hour: number,
  morning = "Xayrli tong",
  afternoon = "Xayrli kun",
  evening = "Xayrli kech",
) {
  if (hour < 12) return morning;
  if (hour < 17) return afternoon;
  return evening;
}

export function formatTime(value: Date | string) {
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, "HH:mm");
}

export function formatLongDate(value: Date | string, locale?: Locale) {
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, "EEEE, d MMMM", { locale });
}

export function formatShortDate(value: Date | string, locale?: Locale) {
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, "d MMM", { locale });
}

export function formatDayHeading(value: Date | string, locale?: Locale) {
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, "EEE d", { locale }).toUpperCase();
}

export function toDateInput(value: Date | string) {
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, "yyyy-MM-dd");
}

export function combineDateAndTime(date: string, time: string) {
  return parseISO(`${date}T${time}:00`);
}

export function addDuration(start: Date, durationMin: number) {
  return addMinutes(start, durationMin);
}

export function minutesBetween(start: Date, end: Date) {
  return Math.round((end.getTime() - start.getTime()) / 60000);
}

export function parseTimeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(total: number) {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function sameDay(a: Date | string, b: Date | string) {
  const left = typeof a === "string" ? parseISO(a) : a;
  const right = typeof b === "string" ? parseISO(b) : b;
  return isSameDay(left, right);
}

export function dayKey(value: Date | string) {
  return toDateInput(value);
}

export function startOfBusinessWeek(date: Date) {
  return startOfWeek(date, { weekStartsOn: 1 });
}

export function atStartOfDay(value: Date | string) {
  const date = typeof value === "string" ? parseISO(value) : value;
  return startOfDay(date);
}
