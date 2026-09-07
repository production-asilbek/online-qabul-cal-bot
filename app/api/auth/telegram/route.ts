import { NextResponse } from "next/server";
import { parseTelegramInitData, validateTelegramInitData } from "@/lib/telegram/validate";

export async function POST(request: Request) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const body = (await request.json()) as { initData?: string };
  if (!botToken) {
    return NextResponse.json({ ok: false, error: "Bot token is not configured." }, { status: 503 });
  }
  if (!body.initData || !validateTelegramInitData(body.initData, botToken)) {
    return NextResponse.json({ ok: false, error: "Invalid Telegram data." }, { status: 401 });
  }

  const parsed = parseTelegramInitData(body.initData);
  return NextResponse.json({
    ok: true,
    user: parsed.user,
  });
}
