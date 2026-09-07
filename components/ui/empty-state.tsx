import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  subtitle,
  actionLabel,
  onAction,
  icon,
}: {
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-8 py-16 text-center">
      <div className="text-4xl opacity-50">{icon ?? "○"}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="max-w-xs text-sm text-[var(--tg-subtitle-text-color)]">{subtitle}</p>
      {actionLabel && onAction ? (
        <Button className="mt-2" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
