import { NextResponse } from "next/server";
import { googleAuthUrl } from "@/lib/auth/google";
import {
  OAUTH_STATE_COOKIE,
  SESSION_COOKIE,
  encodeSession,
  googleConfigured,
  sessionCookieOptions,
} from "@/lib/auth/session";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  if (!googleConfigured()) {
    const token = await encodeSession({
      id: "google-demo",
      email: "owner@qabul.app",
      name: "Google User",
    });
    const response = NextResponse.redirect(`${origin}/register?setup=1`);
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return response;
  }

  const state = crypto.randomUUID();
  const response = NextResponse.redirect(googleAuthUrl(state));
  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });
  return response;
}
