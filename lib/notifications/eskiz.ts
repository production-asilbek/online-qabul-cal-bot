import { digitsOnly } from "@/lib/utils/phone";
import type { NotificationPayload, NotificationResult } from "./types";

const ESKIZ_BASE = "https://notify.eskiz.uz";

let cachedToken: { value: string; expiresAt: number } | null = null;

export function eskizConfigured() {
  return Boolean(process.env.ESKIZ_EMAIL && process.env.ESKIZ_PASSWORD);
}

export function eskizFrom() {
  return process.env.ESKIZ_FROM || "4546";
}

export function eskizEmailHint() {
  const email = process.env.ESKIZ_EMAIL ?? "";
  const at = email.indexOf("@");
  if (!email || at < 2) return email ? "configured" : "";
  return `${email.slice(0, 2)}***${email.slice(at)}`;
}

async function login() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  const email = process.env.ESKIZ_EMAIL ?? "";
  const password = process.env.ESKIZ_PASSWORD ?? "";
  if (!email || !password) {
    throw new Error("Eskiz credentials are not configured.");
  }

  const response = await fetch(`${ESKIZ_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = (await response.json()) as { data?: { token?: string }; message?: string };
  const token = body.data?.token;
  if (!response.ok || !token) {
    throw new Error(body.message ?? `Eskiz login failed (${response.status})`);
  }

  cachedToken = { value: token, expiresAt: Date.now() + 25 * 24 * 60 * 60 * 1000 };
  return token;
}

export async function eskizUser() {
  const token = await login();
  const response = await fetch(`${ESKIZ_BASE}/api/auth/user`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = (await response.json()) as {
    data?: { email?: string; balance?: number; status?: string; name?: string };
    message?: string;
  };
  if (!response.ok) {
    throw new Error(body.message ?? `Eskiz user lookup failed (${response.status})`);
  }
  return body.data ?? {};
}

export async function sendEskizSms(phone: string, message: string): Promise<NotificationResult> {
  const mobile = digitsOnly(phone);
  if (mobile.length < 12) {
    return {
      success: false,
      messageId: crypto.randomUUID(),
      status: "failed",
      provider: "eskiz",
      error: "Phone number must be a full Uzbek number.",
    };
  }

  try {
    const token = await login();
    const response = await fetch(`${ESKIZ_BASE}/api/message/sms/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mobile_phone: mobile,
        message,
        from: eskizFrom(),
      }),
    });
    const body = (await response.json()) as {
      id?: string | number;
      status?: string;
      message?: string;
    };
    if (!response.ok) {
      return {
        success: false,
        messageId: String(body.id ?? crypto.randomUUID()),
        status: "failed",
        provider: "eskiz",
        error: body.message ?? `Eskiz send failed (${response.status})`,
      };
    }
    return {
      success: true,
      messageId: String(body.id ?? crypto.randomUUID()),
      status: "queued",
      provider: "eskiz",
    };
  } catch (error) {
    return {
      success: false,
      messageId: crypto.randomUUID(),
      status: "failed",
      provider: "eskiz",
      error: error instanceof Error ? error.message : "Eskiz send failed",
    };
  }
}

export async function sendEskizPayload(payload: NotificationPayload): Promise<NotificationResult> {
  return sendEskizSms(payload.to, payload.content);
}
