"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/provider";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold">{t.notFound}</h1>
      <p className="mt-2 text-[var(--tg-subtitle-text-color)]">{t.notFoundSubtitle}</p>
      <Link href="/" className="mt-6 font-semibold text-[var(--tg-accent-text-color)]">
        {t.backToTodayShort}
      </Link>
    </main>
  );
}
