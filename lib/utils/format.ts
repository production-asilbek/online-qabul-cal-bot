import type { AppointmentStatus, BusinessType, MemberRole } from "@/types";
import type { Messages } from "@/lib/i18n/messages";

export function fullName(person: { firstName: string; lastName?: string }) {
  return [person.firstName, person.lastName].filter(Boolean).join(" ");
}

export function formatPrice(amount: number, currency = "USD") {
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function formatDuration(minutes: number, t?: Pick<Messages, "min" | "hour" | "hours">) {
  const minLabel = t?.min ?? "daq";
  const hourLabel = t?.hour ?? "soat";
  if (minutes < 60) return `${minutes} ${minLabel}`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (rest === 0) return `${hours} ${hourLabel}`;
  return `${hours}${hourLabel} ${rest}${minLabel}`;
}

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: "Rejalashtirilgan",
  confirmed: "Tasdiqlangan",
  arrived: "Keldi",
  completed: "Yakunlandi",
  cancelled: "Bekor qilindi",
  no_show: "Kelmadi",
};

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  clinic: "Klinika",
  dental: "Stomatologiya",
  beauty: "Go‘zallik",
  barber: "Sartaroshxona",
  fitness: "Fitnes",
  massage: "Massaj",
  repair: "Ta’mirlash",
  other: "Boshqa",
};

export const ROLE_LABELS: Record<MemberRole, string> = {
  owner: "Egasi",
  manager: "Menejer",
  staff: "Xodim",
};

export const REMINDER_OPTIONS = [
  { key: "reminder1h" as const, minutes: 60 },
  { key: "reminder3h" as const, minutes: 180 },
  { key: "reminder1d" as const, minutes: 1440 },
  { key: "reminder2d" as const, minutes: 2880 },
];
