import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card } from "@/components/ui/card";
import { formatTime } from "@/lib/utils/date";
import { fullName } from "@/lib/utils/format";
import type { AppointmentDisplay } from "@/types";

export function AppointmentCard({
  display,
  href,
}: {
  display: AppointmentDisplay;
  href?: string;
}) {
  const content = (
    <Card className="flex items-start gap-4">
      <div className="w-14 shrink-0">
        <div className="font-semibold tabular-nums text-[var(--tg-accent-text-color)]">
          {formatTime(display.appointment.startAt)}
        </div>
        <div
          className="mt-2 h-10 w-1 rounded-full"
          style={{ background: display.staff.color }}
          aria-hidden
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold">{fullName(display.client)}</div>
        <div className="mt-0.5 text-sm">{display.service.name}</div>
        <div className="mt-1 text-sm text-[var(--tg-subtitle-text-color)]">
          {display.staff.title === "Assistant" ? fullName(display.staff) : `Dr. ${display.staff.firstName}`}
        </div>
        <div className="mt-2">
          <StatusBadge status={display.appointment.status} />
        </div>
      </div>
    </Card>
  );

  if (!href) return content;
  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}
