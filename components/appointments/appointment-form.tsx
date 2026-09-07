"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addMinutes, formatISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { ErrorBanner } from "@/components/ui/error-banner";
import { appointmentSchema, type AppointmentInput } from "@/lib/validation/schemas";
import { getClients } from "@/lib/services/clients";
import { createAppointment, getAppointment, updateAppointment } from "@/lib/services/appointments";
import { getServices } from "@/lib/services/services";
import { getStaff } from "@/lib/services/staff";
import { scheduleRemindersForAppointment } from "@/lib/services/reminders";
import { track } from "@/lib/services/analytics";
import { sendMessage, formatAppointmentVariables } from "@/lib/services/messages";
import { combineDateAndTime, formatTime, toDateInput } from "@/lib/utils/date";
import { formatDuration, fullName } from "@/lib/utils/format";
import { haptic } from "@/lib/telegram";
import { useAppStore } from "@/lib/hooks/use-store";
import { useI18n } from "@/lib/i18n/provider";

export function AppointmentForm({ appointmentId }: { appointmentId?: string }) {
  useAppStore();
  const { t } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const existing = appointmentId ? getAppointment(appointmentId) : null;
  const clients = getClients("", 1, 200).items;
  const services = getServices();
  const staff = getStaff();
  const [successId, setSuccessId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const defaults = useMemo(() => {
    const serviceId = existing?.service.id ?? params.get("serviceId") ?? services[0]?.id ?? "";
    const duration = services.find((item) => item.id === serviceId)?.durationMin ?? 30;
    return {
      clientId: existing?.client.id ?? params.get("clientId") ?? "",
      serviceId,
      staffId: existing?.staff.id ?? params.get("staffId") ?? staff[0]?.id ?? "",
      date: existing ? toDateInput(existing.appointment.startAt) : params.get("date") ?? toDateInput(new Date()),
      time: existing ? formatTime(existing.appointment.startAt) : params.get("time") ?? "10:00",
      durationMin: duration,
      notes: existing?.appointment.notes ?? "",
      reminderEnabled: existing?.appointment.reminderEnabled ?? true,
    };
  }, [existing, params, services, staff]);

  const form = useForm<AppointmentInput>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: defaults,
  });

  const serviceId = useWatch({ control: form.control, name: "serviceId" });
  const selectedService = services.find((item) => item.id === serviceId);

  const onSubmit = form.handleSubmit((values) => {
    try {
      const start = combineDateAndTime(values.date, values.time);
      const duration = selectedService?.durationMin ?? values.durationMin;
      if (existing) {
        updateAppointment(existing.appointment.id, {
          clientId: values.clientId,
          serviceId: values.serviceId,
          staffId: values.staffId,
          startAt: formatISO(start),
          endAt: formatISO(addMinutes(start, duration)),
          notes: values.notes,
          reminderEnabled: values.reminderEnabled,
        });
        haptic("success");
        router.push(`/appointments/${existing.appointment.id}`);
        return;
      }
      const created = createAppointment({
        clientId: values.clientId,
        staffId: values.staffId,
        serviceId: values.serviceId,
        startAt: start,
        durationMin: duration,
        notes: values.notes,
        reminderEnabled: values.reminderEnabled,
      });
      track("appointment_created", created.id);
      if (created.reminderEnabled) scheduleRemindersForAppointment(created.id);
      haptic("success");
      setSuccessId(created.id);
    } catch {
      setError(t.somethingWrong);
    }
  });

  if (successId) {
    return (
      <SuccessState
        appointmentId={successId}
        onDone={() => router.push("/")}
        onView={() => router.push(`/appointments/${successId}`)}
      />
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 px-4 pb-8">
      {error ? <ErrorBanner message={error} /> : null}
      <Field label={t.client}>
        <select className="select-field" {...form.register("clientId")}>
          <option value="">{t.selectClient}</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {fullName(client)}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t.services}>
        <select
          className="select-field"
          {...form.register("serviceId")}
          onChange={(event) => {
            form.setValue("serviceId", event.target.value);
            const next = services.find((item) => item.id === event.target.value);
            if (next) form.setValue("durationMin", next.durationMin);
          }}
        >
          <option value="">{t.selectService}</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} · {formatDuration(service.durationMin, t)}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t.date}>
          <Input type="date" {...form.register("date")} />
        </Field>
        <Field label={t.time}>
          <Input type="time" {...form.register("time")} />
        </Field>
      </div>
      <Field label={t.duration}>
        <Input type="number" min={10} step={5} {...form.register("durationMin", { valueAsNumber: true })} />
      </Field>
      <Field label={t.staff}>
        <select className="select-field" {...form.register("staffId")}>
          <option value="">{t.selectStaff}</option>
          {staff.map((member) => (
            <option key={member.id} value={member.id}>
              {member.title.toLowerCase().includes("dentist") ? `${t.dentistPrefix} ${member.firstName}` : fullName(member)} · {member.title}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t.notes}>
        <Textarea placeholder={t.optional} {...form.register("notes")} />
      </Field>
      <label className="flex items-center gap-3 rounded-2xl bg-[var(--tg-section-bg-color)] px-4 py-3">
        <input type="checkbox" className="h-5 w-5" {...form.register("reminderEnabled")} />
        <span className="font-medium">{t.sendReminder}</span>
      </label>
      {form.formState.errors.clientId ? (
        <ErrorBanner message={Object.values(form.formState.errors)[0]?.message ?? t.completeForm} />
      ) : null}
      <Button type="submit" size="lg" className="mt-2 w-full">
        {existing ? t.saveAppointment : t.createAppointment}
      </Button>
    </form>
  );
}

function SuccessState({
  appointmentId,
  onDone,
  onView,
}: {
  appointmentId: string;
  onDone: () => void;
  onView: () => void;
}) {
  const { t } = useI18n();
  const display = getAppointment(appointmentId);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const sendConfirmation = async () => {
    if (!display) return;
    setSending(true);
    try {
      await sendMessage({
        clientId: display.client.id,
        channel: display.client.telegramId ? "telegram" : "sms",
        templateId: "tpl_2",
        content:
          "Hello {{client_name}}, your appointment at {{business_name}} is confirmed for {{date}} at {{time}}.",
        ...formatAppointmentVariables(
          display.appointment.startAt,
          display.service.name,
          fullName(display.staff),
        ),
      });
      setSent(true);
      haptic("success");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="px-5 py-10 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[color-mix(in_srgb,#34C759_16%,transparent)] text-2xl">
        ✓
      </div>
      <h2 className="text-2xl font-semibold">{t.appointmentCreated}</h2>
      <p className="mt-2 text-[var(--tg-subtitle-text-color)]">
        {display ? `${fullName(display.client)} · ${formatTime(display.appointment.startAt)}` : null}
      </p>
      <div className="mt-6 flex flex-col gap-3">
        <Button onClick={sendConfirmation} disabled={sending || sent}>
          {sent ? t.confirmationSent : t.sendConfirmation}
        </Button>
        <Button variant="secondary" onClick={onView}>
          {t.viewAppointment}
        </Button>
        <Button variant="ghost" onClick={onDone}>
          {t.backToToday}
        </Button>
      </div>
    </div>
  );
}
