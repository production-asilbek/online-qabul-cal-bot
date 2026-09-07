import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { eskizConfigured, sendEskizSms } from "@/lib/notifications/eskiz";
import type { NotificationResult } from "@/lib/notifications/types";

function mockResult(phone: string): NotificationResult {
  if (!phone) {
    return {
      success: false,
      messageId: crypto.randomUUID(),
      status: "failed",
      provider: "mock-sms",
      error: "Missing phone number",
    };
  }
  return {
    success: true,
    messageId: `sms_${crypto.randomUUID()}`,
    status: "queued",
    provider: "mock-sms",
  };
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { phone?: string; message?: string };
  const phone = body.phone?.trim() ?? "";
  const message = body.message?.trim() ?? "";
  if (!phone || !message) {
    return NextResponse.json({ error: "phone and message are required" }, { status: 400 });
  }

  const result = eskizConfigured() ? await sendEskizSms(phone, message) : mockResult(phone);
  return NextResponse.json(result, { status: result.success ? 200 : 502 });
}
