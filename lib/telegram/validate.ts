import { createHmac, timingSafeEqual } from "crypto";

export function validateTelegramInitData(initData: string, botToken: string) {
  if (!initData || !botToken) return false;

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return false;
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
  const computed = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  try {
    return timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
  } catch {
    return false;
  }
}

export function parseTelegramInitData(initData: string) {
  const params = new URLSearchParams(initData);
  const userRaw = params.get("user");
  return {
    hash: params.get("hash"),
    authDate: params.get("auth_date"),
    user: userRaw ? (JSON.parse(userRaw) as { id: number; first_name: string }) : null,
  };
}
