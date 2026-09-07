export function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-2xl bg-[color-mix(in_srgb,var(--tg-destructive-text-color)_10%,transparent)] px-4 py-3 text-sm text-[var(--tg-destructive-text-color)]"
    >
      {message}
    </div>
  );
}
