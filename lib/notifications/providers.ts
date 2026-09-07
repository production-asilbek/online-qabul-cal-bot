import type { NotificationPayload, NotificationProvider, NotificationResult } from "./types";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockSmsProvider implements NotificationProvider {
  readonly name = "mock-sms";
  readonly channel = "sms" as const;

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    await delay(250);
    if (!payload.to) {
      return {
        success: false,
        messageId: crypto.randomUUID(),
        status: "failed",
        provider: this.name,
        error: "Missing phone number",
      };
    }

    return {
      success: true,
      messageId: `sms_${crypto.randomUUID()}`,
      status: "queued",
      provider: this.name,
    };
  }
}

export class MockNotificationProvider implements NotificationProvider {
  readonly name = "mock";
  readonly channel: NotificationProvider["channel"];

  constructor(channel: NotificationProvider["channel"] = "sms") {
    this.channel = channel;
  }

  async send(): Promise<NotificationResult> {
    await delay(180);
    return {
      success: true,
      messageId: `mock_${crypto.randomUUID()}`,
      status: "queued",
      provider: this.name,
    };
  }
}

export class TelegramNotificationProvider implements NotificationProvider {
  readonly name = "telegram";
  readonly channel = "telegram" as const;

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    await delay(200);
    if (!payload.to) {
      return {
        success: false,
        messageId: crypto.randomUUID(),
        status: "failed",
        provider: this.name,
        error: "Client has no Telegram ID",
      };
    }

    return {
      success: true,
      messageId: `tg_${crypto.randomUUID()}`,
      status: "queued",
      provider: this.name,
    };
  }
}

export class SmsNotificationProvider implements NotificationProvider {
  readonly name = process.env.SMS_PROVIDER || "mock-sms";
  readonly channel = "sms" as const;
  private readonly inner = new MockSmsProvider();

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    return this.inner.send(payload);
  }
}
