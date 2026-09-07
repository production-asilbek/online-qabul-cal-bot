import { formatISO } from "date-fns";
import { mockStore } from "@/lib/mock/store";
import { renderTemplate } from "@/lib/notifications/templates";
import type { NotificationResult } from "@/lib/notifications/types";
import { getCurrentBusiness } from "@/lib/services/businesses";
import { getClient } from "@/lib/services/clients";
import { formatLongDate, formatTime } from "@/lib/utils/date";
import { fullName } from "@/lib/utils/format";
import type { Message, MessageChannel, MessageStatus, TemplateVariables } from "@/types";
import { track } from "./analytics";

function db() {
  return mockStore.snapshot;
}

function nowIso() {
  return formatISO(new Date());
}

async function deliver(channel: MessageChannel, to: string, content: string): Promise<NotificationResult> {
  if (channel === "sms") {
    const response = await fetch("/api/sms/send", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: to, message: content }),
    });
    const json = (await response.json()) as NotificationResult & { error?: string };
    if (!response.ok && !json.status) {
      return {
        success: false,
        messageId: crypto.randomUUID(),
        status: "failed",
        provider: "eskiz",
        error: json.error ?? "SMS send failed",
      };
    }
    return json;
  }

  if (!to) {
    return {
      success: false,
      messageId: crypto.randomUUID(),
      status: "failed",
      provider: "telegram",
      error: "Client has no Telegram ID",
    };
  }

  return {
    success: true,
    messageId: `tg_${crypto.randomUUID()}`,
    status: "queued",
    provider: "telegram",
  };
}

export function getTemplates() {
  return db().templates.filter((item) => item.businessId === db().currentBusinessId);
}

export function getMessages(clientId?: string) {
  return db()
    .messages.filter((item) => item.businessId === db().currentBusinessId)
    .filter((item) => (clientId ? item.clientId === clientId : true))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getMessage(id: string) {
  return db().messages.find((item) => item.id === id && item.businessId === db().currentBusinessId) ?? null;
}

export function buildTemplateVariables(clientId: string, extras: TemplateVariables = {}): TemplateVariables {
  const client = getClient(clientId);
  const business = getCurrentBusiness();
  return {
    client_name: client ? fullName(client) : "",
    business_name: business.name,
    ...extras,
  };
}

export async function sendMessage(input: {
  clientId: string;
  channel: MessageChannel;
  content: string;
  templateId?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  service?: string;
  staff?: string;
}) {
  const client = getClient(input.clientId);
  if (!client) throw new Error("Client not found");

  const content = renderTemplate(input.content, {
    ...buildTemplateVariables(input.clientId),
    date: input.appointmentDate,
    time: input.appointmentTime,
    service: input.service,
    staff: input.staff,
  });

  const message: Message = {
    id: crypto.randomUUID(),
    businessId: db().currentBusinessId,
    clientId: input.clientId,
    channel: input.channel,
    templateId: input.templateId,
    content,
    status: "queued",
    provider: input.channel === "telegram" ? "telegram" : "sms",
    createdAt: nowIso(),
  };

  mockStore.mutate((draft) => {
    draft.messages.unshift(message);
    draft.messageLogs.push({
      id: crypto.randomUUID(),
      messageId: message.id,
      status: "queued",
      createdAt: nowIso(),
    });
  });

  const to = input.channel === "telegram"
    ? String(client.telegramId ?? client.telegramUsername ?? "")
    : client.phone;

  const result = await deliver(input.channel, to, content);

  const nextStatus: MessageStatus = result.success ? result.status : "failed";

  mockStore.mutate((draft) => {
    const stored = draft.messages.find((item) => item.id === message.id);
    if (!stored) return;
    stored.status = nextStatus;
    stored.provider = result.provider;
    stored.providerMessageId = result.messageId;
    stored.error = result.error;
    stored.sentAt = result.success ? nowIso() : undefined;
    draft.messageLogs.push({
      id: crypto.randomUUID(),
      messageId: message.id,
      status: nextStatus,
      detail: result.error,
      createdAt: nowIso(),
    });
  });

  track(result.success ? "message_sent" : "message_failed", message.id);
  return getMessage(message.id);
}

export function formatAppointmentVariables(startAt: string, serviceName: string, staffName: string) {
  return {
    date: formatLongDate(startAt),
    time: formatTime(startAt),
    service: serviceName,
    staff: staffName,
  };
}
