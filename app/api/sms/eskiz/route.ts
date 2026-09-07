import { NextResponse } from "next/server";
import { eskizConfigured, eskizEmailHint, eskizFrom, eskizUser, sendEskizSms } from "@/lib/notifications/eskiz";

export async function GET() {
  if (!eskizConfigured()) {
    return NextResponse.json({
      ok: false,
      configured: false,
      provider: "mock-sms",
      error: "ESKIZ_EMAIL and ESKIZ_PASSWORD are not set in this app.",
    });
  }

  try {
    const user = await eskizUser();
    return NextResponse.json({
      ok: true,
      configured: true,
      provider: "eskiz",
      from: eskizFrom(),
      email: eskizEmailHint(),
      status: user.status ?? null,
      balance: user.balance ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        provider: "eskiz",
        error: error instanceof Error ? error.message : "Eskiz login failed",
      },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ ok: false, error: "Test send is disabled in production." }, { status: 403 });
  }

  if (!eskizConfigured()) {
    return NextResponse.json({ ok: false, error: "Eskiz is not configured." }, { status: 400 });
  }

  const body = (await request.json()) as { phone?: string; message?: string };
  const phone = body.phone?.trim() ?? "";
  const message = body.message?.trim() || "Bu Eskiz test xabari.";
  if (!phone) {
    return NextResponse.json({ ok: false, error: "phone is required" }, { status: 400 });
  }

  const result = await sendEskizSms(phone, message);
  return NextResponse.json({ ok: result.success, result });
}
