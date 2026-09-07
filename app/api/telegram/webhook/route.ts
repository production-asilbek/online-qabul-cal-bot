import { NextResponse } from "next/server";
import { sendMessage, webAppKeyboard } from "@/lib/telegram/bot";

interface TelegramUpdate {
  message?: {
    chat: { id: number };
    text?: string;
    from?: { first_name?: string };
  };
}

export async function POST(request: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret) {
    const header = request.headers.get("x-telegram-bot-api-secret-token");
    if (header !== secret) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  const update = (await request.json()) as TelegramUpdate;
  const message = update.message;
  if (!message?.chat?.id) {
    return NextResponse.json({ ok: true });
  }

  const text = message.text?.trim() ?? "";
  if (text === "/start" || text.startsWith("/start ") || text === "/app") {
    const keyboard = webAppKeyboard();
    await sendMessage(
      message.chat.id,
      keyboard
        ? `Salom${message.from?.first_name ? `, ${message.from.first_name}` : ""} ☀️\n\nQabul Kalendaringizni Ochish uchun pastdagi Open tugmasiga bosing.`
        : "Mini App URL sozlanmagan.",
      keyboard ? { reply_markup: keyboard } : undefined,
    );
  }

  return NextResponse.json({ ok: true });
}
