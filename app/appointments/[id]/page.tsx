"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ScreenHeader } from "@/components/layout/screen-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAppStore } from "@/lib/hooks/use-store";
import { getAppointment, updateAppointmentStatus } from "@/lib/services/appointments";
import { track } from "@/lib/services/analytics";
import { sendMessage, formatAppointmentVariables } from "@/lib/services/messages";
import { formatLongDate, formatTime } from "@/lib/utils/date";
import { fullName, STATUS_LABELS } from "@/lib/utils/format";
import { haptic } from "@/lib/telegram";
import type { AppointmentStatus } from "@/types";
import Link from "next/link";

const NEXT_STATUSES: AppointmentStatus[] = [
  "scheduled",
  "confirmed",
  "arrived",
  "completed",
  "cancelled",
  "no_show",
];

export default function AppointmentDetailPage() {
  useAppStore();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const display = getAppointment(params.id);

  useEffect(() => {
    if (display) track("appointment_viewed", display.appointment.id);
  }, [display]);

  if (!display) {
    return (
      <main>
        <ScreenHeader title="Appointment" backHref="/calendar" />
        <EmptyState title="Appointment not found" subtitle="It may have been removed." />
      </main>
    );
  }

  const setStatus = (status: AppointmentStatus) => {
    updateAppointmentStatus(display.appointment.id, status);
    if (status === "completed") track("appointment_completed", display.appointment.id);
    if (status === "cancelled") track("appointment_cancelled", display.appointment.id);
    haptic("success");
  };

  return (
    <main className="pb-8">
      <ScreenHeader title="Appointment" backHref="/" />
      <div className="flex flex-col gap-4 px-4">
        <Card>
          <Link href={`/clients/${display.client.id}`} className="text-2xl font-semibold">
            {fullName(display.client)}
          </Link>
          <p className="mt-2">{formatLongDate(display.appointment.startAt)} · {formatTime(display.appointment.startAt)}</p>
          <p className="mt-1">{display.service.name}</p>
          <p className="mt-1 text-sm text-[var(--tg-subtitle-text-color)]">
            {display.staff.title.startsWith("Dentist") ? `Dr. ${display.staff.firstName}` : fullName(display.staff)}
          </p>
          <div className="mt-3">
            <StatusBadge status={display.appointment.status} />
          </div>
          {display.appointment.notes ? (
            <p className="mt-3 text-sm text-[var(--tg-subtitle-text-color)]">{display.appointment.notes}</p>
          ) : null}
        </Card>

        <div>
          <p className="mb-2 text-sm font-semibold">Status</p>
          <div className="flex flex-wrap gap-2">
            {NEXT_STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => setStatus(status)}
                className={`rounded-full px-3 py-2 text-xs font-semibold ${
                  display.appointment.status === status
                    ? "bg-[var(--tg-button-color)] text-[var(--tg-button-text-color)]"
                    : "bg-[var(--tg-section-bg-color)]"
                }`}
              >
                {STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>

        <Button
          variant="secondary"
          onClick={async () => {
            try {
              await sendMessage({
                clientId: display.client.id,
                channel: display.client.telegramId ? "telegram" : "sms",
                content:
                  "Hello {{client_name}}, this is a reminder about your appointment at {{business_name}} at {{time}}.",
                ...formatAppointmentVariables(
                  display.appointment.startAt,
                  display.service.name,
                  fullName(display.staff),
                ),
              });
              haptic("success");
            } catch {
              haptic("error");
            }
          }}
        >
          Send reminder
        </Button>
        <Button variant="secondary" onClick={() => router.push(`/appointments/new?clientId=${display.client.id}`)}>
          Rebook
        </Button>
        <Button variant="ghost" onClick={() => router.push(`/appointments/${display.appointment.id}/edit`)}>
          Edit
        </Button>
      </div>
    </main>
  );
}
