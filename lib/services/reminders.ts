import { formatISO, parseISO, subMinutes } from "date-fns";
import { mockStore } from "@/lib/mock/store";
import { getCurrentBusiness, getBusinessSettings } from "@/lib/services/businesses";
import { getAppointment } from "@/lib/services/appointments";
import { sendMessage, formatAppointmentVariables } from "@/lib/services/messages";
import { fullName } from "@/lib/utils/format";
import type { NotificationJob } from "@/types";

function nowIso() {
  return formatISO(new Date());
}

export function scheduleRemindersForAppointment(appointmentId: string) {
  const display = getAppointment(appointmentId);
  const settings = getBusinessSettings();
  if (!display || !display.appointment.reminderEnabled) return [];

  const jobs: NotificationJob[] = settings.reminderOffsetsMin.map((offset) => {
    const start = parseISO(display.appointment.startAt);
    return {
      id: crypto.randomUUID(),
      businessId: display.appointment.businessId,
      appointmentId,
      clientId: display.client.id,
      channel: settings.defaultChannel,
      type: "appointment_reminder",
      content: `Hello ${fullName(display.client)}, this is a reminder about your appointment at ${getCurrentBusiness().name} at ${formatAppointmentVariables(display.appointment.startAt, display.service.name, fullName(display.staff)).time}.`,
      runAt: formatISO(subMinutes(start, offset)),
      status: "pending",
      createdAt: nowIso(),
    };
  });

  mockStore.mutate((draft) => {
    draft.notificationJobs.push(...jobs);
  });

  return jobs;
}

export async function processDueJobs(now = new Date()) {
  const due = mockStore.snapshot.notificationJobs.filter(
    (job) => job.status === "pending" && parseISO(job.runAt) <= now && job.businessId === mockStore.snapshot.currentBusinessId,
  );

  for (const job of due) {
    mockStore.mutate((draft) => {
      const stored = draft.notificationJobs.find((item) => item.id === job.id);
      if (stored) stored.status = "processing";
    });

    try {
      if (!job.clientId) throw new Error("Missing client");
      const message = await sendMessage({
        clientId: job.clientId,
        channel: job.channel,
        content: job.content,
      });
      mockStore.mutate((draft) => {
        const stored = draft.notificationJobs.find((item) => item.id === job.id);
        if (!stored) return;
        stored.status = message?.status === "failed" ? "failed" : "sent";
        stored.messageId = message?.id;
      });
    } catch {
      mockStore.mutate((draft) => {
        const stored = draft.notificationJobs.find((item) => item.id === job.id);
        if (stored) stored.status = "failed";
      });
    }
  }

  return due.length;
}

export function getNotificationJobs() {
  return mockStore.snapshot.notificationJobs
    .filter((item) => item.businessId === mockStore.snapshot.currentBusinessId)
    .sort((a, b) => b.runAt.localeCompare(a.runAt));
}
