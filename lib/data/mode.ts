export function isMockMode() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("YOUR_PROJECT")) return true;
  return process.env.NEXT_PUBLIC_USE_MOCK === "true";
}

export function dataModeLabel() {
  return isMockMode() ? "mock" : "supabase";
}
