"use client";

import Link from "next/link";
import { formatShortDate } from "@/lib/utils/date";
import { fullName } from "@/lib/utils/format";
import { useI18n } from "@/lib/i18n/provider";
import type { ClientListItem } from "@/types";

export function ClientRow({ client }: { client: ClientListItem }) {
  const { t, dateLocale } = useI18n();
  return (
    <Link
      href={`/clients/${client.id}`}
      className="flex items-center gap-3 border-b border-[color-mix(in_srgb,var(--tg-hint-color)_14%,transparent)] px-4 py-3"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--tg-button-color)_12%,transparent)] text-sm font-semibold text-[var(--tg-accent-text-color)]">
        {client.firstName.slice(0, 1)}
        {client.lastName.slice(0, 1)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold">{fullName(client)}</div>
        <div className="text-sm text-[var(--tg-subtitle-text-color)]">{client.phone}</div>
        <div className="text-xs text-[var(--tg-hint-color)]">
          {t.lastVisitLabel}: {client.lastVisitAt ? formatShortDate(client.lastVisitAt, dateLocale) : "—"}
        </div>
      </div>
    </Link>
  );
}
