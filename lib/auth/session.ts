import { cookies } from "next/headers";

export const SESSION_COOKIE = "qabul_session";
export const OAUTH_STATE_COOKIE = "qabul_oauth_state";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  givenName?: string;
  picture?: string;
};

export { isDemoGoogleUser, isPlaceholderGoogleName } from "./identity";

function secret() {
  return process.env.AUTH_SECRET || process.env.TELEGRAM_BOT_TOKEN || "qabul-dev-secret";
}

function bytesToB64Url(bytes: ArrayBuffer | Uint8Array) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  arr.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64UrlToBytes(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmac(message: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return bytesToB64Url(signature);
}

export async function encodeSession(user: SessionUser) {
  const payload = bytesToB64Url(new TextEncoder().encode(JSON.stringify(user)));
  const signature = await hmac(payload);
  return `${payload}.${signature}`;
}

export async function decodeSession(token: string | undefined | null): Promise<SessionUser | null> {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = await hmac(payload);
  if (expected !== signature) return null;
  try {
    const json = new TextDecoder().decode(b64UrlToBytes(payload));
    const user = JSON.parse(json) as SessionUser;
    if (!user.id || !user.email) return null;
    return user;
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
}

export async function getSessionUser() {
  const jar = await cookies();
  return decodeSession(jar.get(SESSION_COOKIE)?.value);
}

const CANONICAL_APP_ORIGIN = "https://online-qabul-cal-bot.vercel.app";

export function appOrigin() {
  return (process.env.NEXT_PUBLIC_APP_URL || CANONICAL_APP_ORIGIN).replace(/\/$/, "");
}

function requestHostOrigin(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host")?.split(",")[0]?.trim();
  const proto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    (host?.startsWith("localhost") || host?.startsWith("127.") ? "http" : "https");
  if (!host) return "";
  return `${proto}://${host}`.replace(/\/$/, "");
}

export function oauthOrigin(request: Request) {
  const fromRequest = requestHostOrigin(request);
  if (fromRequest === CANONICAL_APP_ORIGIN) return CANONICAL_APP_ORIGIN;
  if (fromRequest.startsWith("http://localhost") || fromRequest.startsWith("http://127.0.0.1")) {
    return fromRequest;
  }
  return CANONICAL_APP_ORIGIN;
}

export function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}
