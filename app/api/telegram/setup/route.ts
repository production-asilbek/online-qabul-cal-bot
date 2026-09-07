import { NextResponse } from "next/server";
import { configureBot, getMe } from "@/lib/telegram/bot";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ ok: false, error: "Not available." }, { status: 404 });
  }

  try {
    const me = await getMe();
    const configured = await configureBot();
    return NextResponse.json({ ok: true, bot: me, configured });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Could not configure the bot." },
      { status: 500 },
    );
  }
}

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ ok: false, error: "Not available." }, { status: 404 });
  }

  try {
    const me = await getMe();
    return NextResponse.json({
      ok: true,
      bot: { id: me.id, username: me.username, name: me.first_name },
      appUrl: process.env.NEXT_PUBLIC_APP_URL || null,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Bot token is invalid." }, { status: 401 });
  }
}
