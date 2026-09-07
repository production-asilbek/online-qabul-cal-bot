import { NextResponse } from "next/server";
import { processDueJobs } from "@/lib/services/reminders";

export async function POST() {
  const processed = await processDueJobs();
  return NextResponse.json({ ok: true, processed });
}
