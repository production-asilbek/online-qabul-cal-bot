"use client";

import { ReactNode, useEffect } from "react";
import { cn } from "@/lib/utils/cn";

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button aria-label="Close" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative w-full max-w-lg rounded-t-[24px] bg-[var(--tg-section-bg-color)] p-5 pb-[calc(20px+env(safe-area-inset-bottom))] shadow-2xl",
        )}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[color-mix(in_srgb,var(--tg-hint-color)_40%,transparent)]" />
        {title ? <h2 className="mb-4 text-lg font-semibold">{title}</h2> : null}
        {children}
      </div>
    </div>
  );
}
