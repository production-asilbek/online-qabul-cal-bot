import type { AppointmentStatus } from "@/types";
import { STATUS_LABELS } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

const TONES: Record<AppointmentStatus, string> = {
  scheduled: "bg-[color-mix(in_srgb,var(--tg-button-color)_12%,transparent)] text-[var(--tg-accent-text-color)]",
  confirmed: "bg-[color-mix(in_srgb,#2A9D8F_14%,transparent)] text-[#1F7A6E]",
  arrived: "bg-[color-mix(in_srgb,#C9A227_18%,transparent)] text-[#8A6D12]",
  completed: "bg-[color-mix(in_srgb,#34C759_14%,transparent)] text-[#1F8A3B]",
  cancelled: "bg-[color-mix(in_srgb,var(--tg-hint-color)_16%,transparent)] text-[var(--tg-subtitle-text-color)]",
  no_show: "bg-[color-mix(in_srgb,var(--tg-destructive-text-color)_12%,transparent)] text-[var(--tg-destructive-text-color)]",
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold", TONES[status])}>
      {STATUS_LABELS[status]}
    </span>
  );
}
