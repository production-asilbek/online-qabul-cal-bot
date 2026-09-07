export function isPlaceholderGoogleName(name: string) {
  return /^google(\s+user)?$/i.test(name.trim());
}

export function isDemoGoogleUser(user: { id?: string; name?: string } | null | undefined) {
  return !user || user.id === "google-demo" || isPlaceholderGoogleName(user.name ?? "");
}
