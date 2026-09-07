import { addMinutes, formatISO, parseISO, startOfDay } from "date-fns";
import { mockStore } from "@/lib/mock/store";
import type { Appointment, AppointmentDisplay, AppointmentStatus } from "@/types";

function db() {
  return mockStore.snapshot;
}

function businessId() {
  return db().currentBusinessId;
}

function nowIso() {
  return formatISO(new Date());
}

export function getAppointments(rangeStart?: Date, rangeEnd?: Date) {
  return db()
    .appointments.filter((item) => item.businessId === businessId())
    .filter((item) => {
      if (!rangeStart || !rangeEnd) return true;
      const start = parseISO(item.startAt);
      return start >= rangeStart && start < rangeEnd;
    })
    .sort((a, b) => a.startAt.localeCompare(b.startAt));
}

export function getTodayAppointments() {
  const start = startOfDay(new Date());
  const end = addMinutes(start, 24 * 60);
  return hydrateAppointments(getAppointments(start, end));
}

export function getUpcomingAppointments(limit = 20) {
  const now = new Date();
  return hydrateAppointments(
    db()
      .appointments.filter((item) => item.businessId === businessId())
      .filter((item) => parseISO(item.startAt) >= now && !["cancelled", "no_show", "completed"].includes(item.status))
      .sort((a, b) => a.startAt.localeCompare(b.startAt))
      .slice(0, limit),
  );
}

export function getAppointment(id: string) {
  const appointment = db().appointments.find((item) => item.id === id && item.businessId === businessId());
  if (!appointment) return null;
  return hydrateAppointments([appointment])[0] ?? null;
}

export function getClientAppointments(clientId: string) {
  return hydrateAppointments(
    db()
      .appointments.filter((item) => item.businessId === businessId() && item.clientId === clientId)
      .sort((a, b) => b.startAt.localeCompare(a.startAt)),
  );
}

export function createAppointment(input: {
  clientId: string;
  staffId: string;
  serviceId: string;
  startAt: Date;
  durationMin: number;
  notes?: string;
  reminderEnabled: boolean;
}) {
  const appointment: Appointment = {
    id: crypto.randomUUID(),
    businessId: businessId(),
    clientId: input.clientId,
    staffId: input.staffId,
    serviceId: input.serviceId,
    startAt: formatISO(input.startAt),
    endAt: formatISO(addMinutes(input.startAt, input.durationMin)),
    status: "scheduled",
    notes: input.notes,
    reminderEnabled: input.reminderEnabled,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  mockStore.mutate((draft) => {
    draft.appointments.push(appointment);
    draft.appointmentStatusHistory.push({
      id: crypto.randomUUID(),
      appointmentId: appointment.id,
      toStatus: "scheduled",
      createdAt: nowIso(),
    });
  });

  return appointment;
}

export function updateAppointment(id: string, patch: Partial<Appointment>) {
  let updated: Appointment | null = null;
  mockStore.mutate((draft) => {
    const appointment = draft.appointments.find(
      (item) => item.id === id && item.businessId === draft.currentBusinessId,
    );
    if (!appointment) return;
    const fromStatus = appointment.status;
    Object.assign(appointment, patch, { updatedAt: nowIso() });
    if (patch.status && patch.status !== fromStatus) {
      draft.appointmentStatusHistory.push({
        id: crypto.randomUUID(),
        appointmentId: id,
        fromStatus,
        toStatus: patch.status,
        createdAt: nowIso(),
      });
    }
    updated = { ...appointment };
  });
  return updated;
}

export function updateAppointmentStatus(id: string, status: AppointmentStatus) {
  return updateAppointment(id, { status });
}

export function moveAppointment(id: string, startAt: Date, endAt: Date) {
  return updateAppointment(id, { startAt: formatISO(startAt), endAt: formatISO(endAt) });
}

export function hydrateAppointments(appointments: Appointment[]): AppointmentDisplay[] {
  const { clients, services, staff } = db();
  return appointments.flatMap((appointment) => {
    const client = clients.find((item) => item.id === appointment.clientId);
    const service = services.find((item) => item.id === appointment.serviceId);
    const member = staff.find((item) => item.id === appointment.staffId);
    if (!client || !service || !member) return [];
    return [{ appointment, client, service, staff: member }];
  });
}

export function getMonthStats() {
  const start = startOfDay(new Date());
  start.setDate(1);
  const items = db().appointments.filter(
    (item) => item.businessId === businessId() && parseISO(item.startAt) >= start,
  );
  const services = db().services;
  const completed = items.filter((item) => item.status === "completed");
  const revenue = completed.reduce((sum, item) => {
    const service = services.find((entry) => entry.id === item.serviceId);
    return sum + (service?.price ?? 0);
  }, 0);

  return {
    appointments: items.length,
    completed: completed.length,
    cancelled: items.filter((item) => item.status === "cancelled").length,
    noShow: items.filter((item) => item.status === "no_show").length,
    revenue,
    today: getTodayAppointments().filter((item) => !["cancelled"].includes(item.appointment.status)).length,
    upcoming: getUpcomingAppointments(100).length,
    clients: db().clients.filter((item) => item.businessId === businessId()).length,
  };
}
