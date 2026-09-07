export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-[color-mix(in_srgb,var(--tg-hint-color)_16%,transparent)] ${className}`}
    />
  );
}
