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

export function eskizPhone(phone: string) {
  let mobile = digitsOnly(phone);
  if (mobile.startsWith("8") && mobile.length === 12) {
    mobile = `998${mobile.slice(1)}`;
  }
  if (mobile.length === 9) {
    mobile = `998${mobile}`;
  }
  return mobile;
}

async function parseJson(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { message: text || `Eskiz HTTP ${response.status}` };
  }
}

function tokenFrom(body: Record<string, unknown>) {
  const data = body.data as { token?: string } | undefined;
  return data?.token;
}

async function loginRequest(email: string, password: string, mode: "form" | "json") {
  if (mode === "form") {
    const form = new FormData();
    form.set("email", email);
    form.set("password", password);
    return fetch(`${ESKIZ_BASE}/api/auth/login`, { method: "POST", body: form });
  }

  return fetch(`${ESKIZ_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
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

  let lastError = "Eskiz login failed";
  for (const mode of ["form", "json"] as const) {
    const response = await loginRequest(email, password, mode);
    const body = await parseJson(response);
    const token = tokenFrom(body);
    if (response.ok && token) {
      cachedToken = { value: token, expiresAt: Date.now() + 25 * 24 * 60 * 60 * 1000 };
      return token;
    }
    lastError = String(body.message ?? `Eskiz login failed (${response.status})`);
  }

  throw new Error(lastError);
}

async function refreshToken(token: string) {
  const response = await fetch(`${ESKIZ_BASE}/api/auth/refresh`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await parseJson(response);
  const next = tokenFrom(body) ?? token;
  if (!response.ok) {
    cachedToken = null;
    return login();
  }
  cachedToken = { value: next, expiresAt: Date.now() + 25 * 24 * 60 * 60 * 1000 };
  return next;
}

async function authorizedFetch(path: string, init: RequestInit = {}, retry = true): Promise<Response> {
  const token = await login();
  const response = await fetch(`${ESKIZ_BASE}${path}`, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status === 401 && retry) {
    cachedToken = null;
    try {
      await refreshToken(token);
    } catch {
      await login();
    }
    return authorizedFetch(path, init, false);
  }
  return response;
}

export async function eskizUser() {
  const response = await authorizedFetch("/api/auth/user");
  const body = await parseJson(response);
  if (!response.ok) {
    throw new Error(String(body.message ?? `Eskiz user lookup failed (${response.status})`));
  }
  return (body.data as Record<string, unknown> | undefined) ?? {};
}

const ESKIZ_TEST_TEXT = "Bu Eskiz dan test";

function isEskizTestOnlyError(message: string) {
  return /для теста|test from eskiz|eskiz dan test|тест от eskiz/i.test(message);
}

function isEskizApprovedTestText(message: string) {
  const normalized = message.trim();
  return (
    normalized === "Bu Eskiz dan test" ||
    normalized === "Это тест от Eskiz" ||
    normalized === "This is test from Eskiz"
  );
}

async function postEskizSms(mobile: string, message: string) {
  const form = new FormData();
  form.set("mobile_phone", mobile);
  form.set("message", message);
  form.set("from", eskizFrom());

  let response = await authorizedFetch("/api/message/sms/send", {
    method: "POST",
    body: form,
  });
  let body = await parseJson(response);
  if (!response.ok && (response.status === 400 || response.status === 415 || response.status === 422)) {
    response = await authorizedFetch("/api/message/sms/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mobile_phone: mobile,
        message,
        from: eskizFrom(),
      }),
    });
    body = await parseJson(response);
  }
  const id = body.id ?? (body.data as { id?: string | number } | undefined)?.id;
  return { response, body, id };
}

export async function sendEskizSms(phone: string, message: string): Promise<NotificationResult> {
  const mobile = eskizPhone(phone);
  if (mobile.length !== 12 || !mobile.startsWith("998")) {
    return {
      success: false,
      messageId: crypto.randomUUID(),
      status: "failed",
      provider: "eskiz",
      error: "Phone number must be a full Uzbek number.",
    };
  }

  try {
    let { response, body, id } = await postEskizSms(mobile, message);
    let warning: string | undefined;

    if (!response.ok) {
      const error = String(body.message ?? `Eskiz send failed (${response.status})`);
      if (isEskizTestOnlyError(error) && !isEskizApprovedTestText(message)) {
        const retry = await postEskizSms(mobile, ESKIZ_TEST_TEXT);
        response = retry.response;
        body = retry.body;
        id = retry.id;
        if (response.ok) {
          warning =
            "Eskiz test rejimida. Telefonga faqat «Bu Eskiz dan test» yuborildi. Haqiqiy tasdiq matni uchun Eskiz kabinetida shablonni tasdiqlating.";
        } else {
          return {
            success: false,
            messageId: String(retry.id ?? crypto.randomUUID()),
            status: "failed",
            provider: "eskiz",
            error: String(retry.body.message ?? error),
          };
        }
      } else {
        return {
          success: false,
          messageId: String(id ?? crypto.randomUUID()),
          status: "failed",
          provider: "eskiz",
          error,
        };
      }
    }

    return {
      success: true,
      messageId: String(id ?? crypto.randomUUID()),
      status: "queued",
      provider: "eskiz",
      warning,
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
