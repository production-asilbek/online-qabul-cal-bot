"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useTelegramBack } from "@/lib/hooks/use-telegram-back";

export function ScreenHeader({
  title,
  backHref,
  action,
}: {
  title: string;
  backHref?: string;
  action?: React.ReactNode;
}) {
  useTelegramBack(Boolean(backHref));

  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 bg-[var(--tg-header-bg-color)]/90 px-4 py-3 backdrop-blur-md">
      {backHref ? (
        <Link
          href={backHref}
          aria-label="Back"
          className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--tg-accent-text-color)]"
        >
          <ChevronLeft size={26} />
        </Link>
      ) : (
        <div className="w-2" />
      )}
      <h1 className="flex-1 text-lg font-semibold">{title}</h1>
      {action ?? <div className="w-10" />}
    </header>
  );
}
