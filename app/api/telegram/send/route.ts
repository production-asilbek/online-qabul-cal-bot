import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { sendTelegramMessage } from "@/lib/notifications/telegram";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { to?: string; chatId?: string; message?: string };
  const to = (body.to ?? body.chatId)?.trim() ?? "";
  const message = body.message?.trim() ?? "";
  if (!to || !message) {
    return NextResponse.json({ error: "to and message are required" }, { status: 400 });
  }

  const result = await sendTelegramMessage(to, message);
  return NextResponse.json(result, { status: result.success ? 200 : 502 });
}
