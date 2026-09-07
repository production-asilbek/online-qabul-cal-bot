"use client";

import { format } from "date-fns";
import { AppointmentCard } from "@/components/appointments/appointment-card";
import { QuickActions } from "@/components/appointments/quick-actions";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { useAppStore } from "@/lib/hooks/use-store";
import { getTodayAppointments } from "@/lib/services/appointments";
import { getCurrentBusiness } from "@/lib/services/businesses";
import { greetingForHour } from "@/lib/utils/date";
import { useI18n } from "@/lib/i18n/provider";
import { useGoogleAccount } from "@/lib/auth/display-name";
import { useRouter } from "next/navigation";

export default function TodayPage() {
  useAppStore();
  const { t, dateLocale } = useI18n();
  const { givenName } = useGoogleAccount();
  const router = useRouter();
  const business = getCurrentBusiness();
  const appointments = getTodayAppointments();
  const greeting = greetingForHour(
    new Date().getHours(),
    t.greetingMorning,
    t.greetingAfternoon,
    t.greetingEvening,
  );

  return (
    <main className="px-4 pb-8 pt-6">
      <p className="text-sm text-[var(--tg-subtitle-text-color)]">{business.name}</p>
      <h1 className="mt-1 text-[28px] font-semibold tracking-tight">
        {greeting}, {givenName}
      </h1>
      <p className="mt-1 text-[var(--tg-subtitle-text-color)]">
        {format(new Date(), "EEEE, d MMMM", { locale: dateLocale })}
      </p>

      <div className="mt-8">
        <SectionHeader title={t.todayAppointments} />
        {appointments.length === 0 ? (
          <EmptyState
            title={t.todayClearTitle}
            subtitle={t.todayClearSubtitle}
            actionLabel={`+ ${t.bookAppointment}`}
            onAction={() => router.push("/appointments/new")}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {appointments.map((display) => (
              <AppointmentCard
                key={display.appointment.id}
                display={display}
                href={`/appointments/${display.appointment.id}`}
              />
            ))}
          </div>
        )}
      </div>
      <QuickActions />
    </main>
  );
}
