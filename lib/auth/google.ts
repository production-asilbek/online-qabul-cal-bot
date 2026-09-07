export function googleRedirectUri(origin: string) {
  return `${origin.replace(/\/$/, "")}/api/auth/google/callback`;
}

export function googleAuthUrl(state: string, origin: string) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: googleRedirectUri(origin),
    response_type: "code",
    scope: "openid email profile",
    prompt: "select_account",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string, origin: string) {
  const body = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    redirect_uri: googleRedirectUri(origin),
    grant_type: "authorization_code",
  });
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = (await response.json()) as { id_token?: string; error?: string };
  if (!json.id_token) {
    throw new Error(json.error ?? "Google token exchange failed");
  }
  const payload = JSON.parse(
    Buffer.from(json.id_token.split(".")[1] ?? "", "base64url").toString("utf8"),
  ) as {
    sub?: string;
    email?: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
    aud?: string;
    iss?: string;
  };
  if (payload.aud !== process.env.GOOGLE_CLIENT_ID) {
    throw new Error("Google token audience mismatch");
  }
  if (payload.iss !== "https://accounts.google.com" && payload.iss !== "accounts.google.com") {
    throw new Error("Google token issuer mismatch");
  }
  if (!payload.sub || !payload.email) {
    throw new Error("Google profile is incomplete");
  }
  const name = payload.name || [payload.given_name, payload.family_name].filter(Boolean).join(" ") || payload.email.split("@")[0];
  return {
    id: payload.sub,
    email: payload.email,
    name,
    givenName: payload.given_name || name.split(/\s+/)[0],
    picture: payload.picture,
  };
}
