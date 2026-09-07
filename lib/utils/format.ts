import type { AppointmentStatus, BusinessType, MemberRole } from "@/types";

export function fullName(person: { firstName: string; lastName?: string }) {
  return [person.firstName, person.lastName].filter(Boolean).join(" ");
}

export function formatPrice(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (rest === 0) return hours === 1 ? "1 hour" : `${hours} hours`;
  return `${hours}h ${rest}m`;
}

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: "Scheduled",
  confirmed: "Confirmed",
  arrived: "Arrived",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-show",
};

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  clinic: "Clinic",
  dental: "Dental",
  beauty: "Beauty",
  barber: "Barber",
  fitness: "Fitness",
  massage: "Massage",
  repair: "Repair",
  other: "Other",
};

export const ROLE_LABELS: Record<MemberRole, string> = {
  owner: "Owner",
  manager: "Manager",
  staff: "Staff",
};

export const REMINDER_OPTIONS = [
  { label: "1 hour", minutes: 60 },
  { label: "3 hours", minutes: 180 },
  { label: "1 day", minutes: 1440 },
  { label: "2 days", minutes: 2880 },
];
