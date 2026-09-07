import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { exchangeGoogleCode } from "@/lib/auth/google";
import {
  OAUTH_STATE_COOKIE,
  SESSION_COOKIE,
  encodeSession,
  sessionCookieOptions,
} from "@/lib/auth/session";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const jar = await cookies();
  const expected = jar.get(OAUTH_STATE_COOKIE)?.value;

  if (!code || !state || !expected || state !== expected) {
    return NextResponse.redirect(`${new URL(request.url).origin}/register?error=google`);
  }

  try {
    const profile = await exchangeGoogleCode(code);
    const token = await encodeSession(profile);
    const response = NextResponse.redirect(`${new URL(request.url).origin}/register?setup=1`);
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    response.cookies.set(OAUTH_STATE_COOKIE, "", { path: "/", maxAge: 0 });
    return response;
  } catch {
    return NextResponse.redirect(`${new URL(request.url).origin}/register?error=google`);
  }
}
