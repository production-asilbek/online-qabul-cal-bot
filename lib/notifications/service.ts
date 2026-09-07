import type { NotificationPayload, NotificationProvider, NotificationResult } from "./types";
import {
  MockNotificationProvider,
  MockSmsProvider,
  SmsNotificationProvider,
  TelegramNotificationProvider,
} from "./providers";
import { renderTemplate, SYSTEM_TEMPLATES } from "./templates";

export { renderTemplate, SYSTEM_TEMPLATES };

const providers: Record<string, NotificationProvider> = {
  sms: new SmsNotificationProvider(),
  telegram: new TelegramNotificationProvider(),
  mock: new MockNotificationProvider(),
  "mock-sms": new MockSmsProvider(),
};

export function getNotificationProvider(channel: NotificationPayload["channel"]): NotificationProvider {
  return providers[channel] ?? providers.mock;
}

export async function sendNotification(payload: NotificationPayload): Promise<NotificationResult> {
  const provider = getNotificationProvider(payload.channel);
  return provider.send(payload);
}

export async function sendSMS(payload: Omit<NotificationPayload, "channel">) {
  return sendNotification({ ...payload, channel: "sms" });
}
