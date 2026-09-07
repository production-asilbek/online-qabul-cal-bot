import { sendMessage } from "@/lib/telegram/bot";
import type { NotificationPayload, NotificationResult } from "./types";

export function telegramBotConfigured() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN);
}

export function telegramChatId(to: string) {
  const digits = to.replace(/\D/g, "");
  if (digits.length < 5) return null;
  const id = Number(digits);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export async function sendTelegramMessage(to: string, message: string): Promise<NotificationResult> {
  const chatId = telegramChatId(to);
  if (!chatId) {
    return {
      success: false,
      messageId: crypto.randomUUID(),
      status: "failed",
      provider: "telegram",
      error: "Client needs a numeric Telegram ID. They must open @qabulcalbot and tap /start.",
    };
  }

  if (!telegramBotConfigured()) {
    return {
      success: false,
      messageId: crypto.randomUUID(),
      status: "failed",
      provider: "telegram",
      error: "TELEGRAM_BOT_TOKEN is not configured.",
    };
  }

  try {
    const result = await sendMessage(chatId, message);
    const id = (result as { message_id?: number } | undefined)?.message_id;
    return {
      success: true,
      messageId: String(id ?? crypto.randomUUID()),
      status: "sent",
      provider: "telegram",
    };
  } catch (error) {
    const text = error instanceof Error ? error.message : "Telegram send failed";
    return {
      success: false,
      messageId: crypto.randomUUID(),
      status: "failed",
      provider: "telegram",
      error: /chat not found|bot can't initiate/i.test(text)
        ? "Client must open @qabulcalbot and tap /start before they can receive messages."
        : text,
    };
  }
}

export async function sendTelegramPayload(payload: NotificationPayload): Promise<NotificationResult> {
  return sendTelegramMessage(payload.to, payload.content);
}
