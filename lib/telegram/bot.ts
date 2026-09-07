const TELEGRAM_API = "https://api.telegram.org";

function botToken() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not configured.");
  return token;
}

function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
}

export async function telegramCall<T>(method: string, body?: Record<string, unknown>) {
  const response = await fetch(`${TELEGRAM_API}/bot${botToken()}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = (await response.json()) as { ok: boolean; result?: T; description?: string };
  if (!json.ok) {
    throw new Error(json.description ?? `Telegram ${method} failed`);
  }
  return json.result as T;
}

export async function getMe() {
  return telegramCall<{ id: number; username: string; first_name: string }>("getMe");
}

export async function sendMessage(chatId: number, text: string, extra?: Record<string, unknown>) {
  return telegramCall("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    ...extra,
  });
}

export function webAppKeyboard() {
  const url = appUrl();
  if (!url) return undefined;
  return {
    inline_keyboard: [
      [{ text: "Open calendar", web_app: { url } }],
    ],
  };
}

export async function configureBot() {
  const url = appUrl();
  await telegramCall("setMyCommands", {
    commands: [
      { command: "start", description: "Open Qabul Kalendarim" },
      { command: "app", description: "Open the Mini App" },
    ],
  });
  await telegramCall("setMyDescription", {
    description: "Calendar, clients, and reminders for your service business.",
  });
  await telegramCall("setMyShortDescription", {
    short_description: "Your business assistant inside Telegram.",
  });

  if (url.startsWith("https://")) {
    await telegramCall("setChatMenuButton", {
      menu_button: {
        type: "web_app",
        text: "Open",
        web_app: { url },
      },
    });
  }

  return { username: (await getMe()).username, appUrl: url || null };
}
