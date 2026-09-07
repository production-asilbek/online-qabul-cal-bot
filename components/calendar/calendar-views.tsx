"use client";

import { addDays, isSameDay } from "date-fns";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { AppointmentCard } from "@/components/appointments/appointment-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDayHeading, formatTime, toDateInput } from "@/lib/utils/date";
import { buildTimeSlots, hoursForDate } from "@/lib/utils/schedule";
import { fullName } from "@/lib/utils/format";
import { haptic } from "@/lib/telegram";
import { useI18n, weekdayLetters } from "@/lib/i18n/provider";
import type { AppointmentDisplay, WorkingHours } from "@/types";
import { parseISO } from "date-fns";

export function DayView({
  date,
  appointments,
  hours,
  onSwipe,
}: {
  date: Date;
  appointments: AppointmentDisplay[];
  hours: WorkingHours[];
  onSwipe?: (direction: -1 | 1) => void;
}) {
  const router = useRouter();
  const { t, dateLocale } = useI18n();
  const startX = useRef<number | null>(null);
  const dayHours = hoursForDate(hours, date);
  const slots = buildTimeSlots(dayHours);
  const dayAppointments = appointments.filter((item) => isSameDay(parseISO(item.appointment.startAt), date));

  const onTouchStart = (event: React.TouchEvent) => {
    startX.current = event.changedTouches[0]?.clientX ?? null;
  };
  const onTouchEnd = (event: React.TouchEvent) => {
    if (startX.current == null) return;
    const delta = event.changedTouches[0].clientX - startX.current;
    if (Math.abs(delta) > 50) onSwipe?.(delta < 0 ? 1 : -1);
    startX.current = null;
  };

  if (dayHours?.isClosed) {
    return (
      <EmptyState title={t.closed} subtitle={t.closedSubtitle} />
    );
  }

  return (
    <div className="px-4 pb-8" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="mb-4 text-sm font-semibold tracking-wide text-[var(--tg-subtitle-text-color)]">
        {formatDayHeading(date, dateLocale)}
      </div>
      {slots.length === 0 ? (
        <EmptyState
          title={t.todayClearTitle}
          subtitle={t.noHours}
          actionLabel={`+ ${t.bookAppointment}`}
          onAction={() => router.push(`/appointments/new?date=${toDateInput(date)}`)}
        />
      ) : (
        <div className="flex flex-col">
          {slots.map((slot) => {
            const slotAppointments = dayAppointments.filter(
              (item) => formatTime(item.appointment.startAt) === slot,
            );
            return (
              <div key={slot} className="grid grid-cols-[56px_1fr] gap-3 py-2">
                <div className="pt-2 text-sm tabular-nums text-[var(--tg-hint-color)]">{slot}</div>
                <div>
                  {slotAppointments.length > 0 ? (
                    slotAppointments.map((item) => (
                      <div key={item.appointment.id} className="mb-2">
                        <CompactAppointment display={item} />
                      </div>
                    ))
                  ) : (
                    <button
                      onClick={() => {
                        haptic("light");
                        router.push(`/appointments/new?date=${toDateInput(date)}&time=${slot}`);
                      }}
                      className="h-10 w-full rounded-xl border border-dashed border-[color-mix(in_srgb,var(--tg-hint-color)_35%,transparent)] text-left text-xs text-[var(--tg-hint-color)]"
                      aria-label={`${t.createAt} ${slot}`}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {dayAppointments.length === 0 && slots.length > 0 ? (
        <div className="pt-4">
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => router.push(`/appointments/new?date=${toDateInput(date)}`)}
          >
            + {t.bookAppointment}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function CompactAppointment({ display }: { display: AppointmentDisplay }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(`/appointments/${display.appointment.id}`)}
      className="w-full rounded-2xl p-3 text-left"
      style={{ background: `${display.staff.color}18` }}
    >
      <div className="font-semibold">{fullName(display.client)}</div>
      <div className="text-sm text-[var(--tg-subtitle-text-color)]">{display.service.name}</div>
    </button>
  );
}

export function MultiDayView({
  start,
  days,
  appointments,
}: {
  start: Date;
  days: number;
  appointments: AppointmentDisplay[];
}) {
  const { dateLocale } = useI18n();
  const dates = Array.from({ length: days }, (_, index) => addDays(start, index));
  return (
    <div className={`grid gap-2 px-3 pb-8 ${days > 3 ? "grid-cols-7" : "grid-cols-3"}`}>
      {dates.map((date) => {
        const items = appointments.filter((item) => isSameDay(parseISO(item.appointment.startAt), date));
        return (
          <div key={date.toISOString()} className="min-h-[320px] rounded-[18px] bg-[var(--tg-section-bg-color)] p-2">
            <div className="mb-2 text-center text-[11px] font-semibold text-[var(--tg-subtitle-text-color)]">
              {formatDayHeading(date, dateLocale)}
            </div>
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <CompactAppointment key={item.appointment.id} display={item} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function MonthView({
  month,
  selected,
  appointments,
  onSelect,
}: {
  month: Date;
  selected: Date;
  appointments: AppointmentDisplay[];
  onSelect: (date: Date) => void;
}) {
  const { t } = useI18n();
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const startOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: startOffset + daysInMonth }, (_, index) => {
    if (index < startOffset) return null;
    return new Date(month.getFullYear(), month.getMonth(), index - startOffset + 1);
  });

  return (
    <div className="px-4 pb-8">
      <div className="mb-2 grid grid-cols-7 text-center text-[11px] font-semibold text-[var(--tg-hint-color)]">
        {weekdayLetters(t).map((label, index) => (
          <div key={`${label}-${index}`}>{label}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-2">
        {cells.map((date, index) => {
          if (!date) return <div key={`empty-${index}`} />;
          const has = appointments.some((item) => isSameDay(parseISO(item.appointment.startAt), date));
          const active = isSameDay(date, selected);
          return (
            <button
              key={date.toISOString()}
              onClick={() => onSelect(date)}
              className={`mx-auto flex h-10 w-10 flex-col items-center justify-center rounded-full text-sm ${
                active ? "bg-[var(--tg-button-color)] text-[var(--tg-button-text-color)]" : ""
              }`}
            >
              {date.getDate()}
              {has ? <span className={`mt-0.5 h-1 w-1 rounded-full ${active ? "bg-white" : "bg-[var(--tg-button-color)]"}`} /> : null}
            </button>
          );
        })}
      </div>
      <div className="mt-5 flex flex-col gap-3">
        {appointments
          .filter((item) => isSameDay(parseISO(item.appointment.startAt), selected))
          .map((item) => (
            <AppointmentCard key={item.appointment.id} display={item} href={`/appointments/${item.appointment.id}`} />
          ))}
      </div>
    </div>
  );
}
