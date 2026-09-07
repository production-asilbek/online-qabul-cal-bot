"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ScreenHeader } from "@/components/layout/screen-header";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Card } from "@/components/ui/card";
import { useAppStore } from "@/lib/hooks/use-store";
import { getCurrentBusiness, getCurrentUser } from "@/lib/services/businesses";
import { fullName } from "@/lib/utils/format";
import { businessTypeLabel, useI18n } from "@/lib/i18n/provider";

export default function MorePage() {
  useAppStore();
  const { t } = useI18n();
  const user = getCurrentUser();
  const business = getCurrentBusiness();

  const links = [
    { href: "/dashboard", label: t.overview },
    { href: "/services", label: t.services },
    { href: "/staff", label: t.staffTitle },
    { href: "/messages", label: t.messages },
    { href: "/settings", label: t.settings },
    { href: "/clients/import", label: t.importClients },
    ...(process.env.NODE_ENV === "production" ? [] : [{ href: "/dev", label: t.developer }]),
  ];

  return (
    <main className="pb-8 pt-2">
      <ScreenHeader title={t.more} />
      <Card className="mx-4 mb-5">
        <div className="text-sm text-[var(--tg-subtitle-text-color)]">{businessTypeLabel(t, business.type)}</div>
        <div className="text-xl font-semibold">{business.name}</div>
        <div className="mt-1 text-sm text-[var(--tg-subtitle-text-color)]">
          {fullName(user)} · {t.owner}
        </div>
      </Card>
      <div className="mx-4 overflow-hidden rounded-[18px] bg-[var(--tg-section-bg-color)]">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center justify-between border-b border-[color-mix(in_srgb,var(--tg-hint-color)_12%,transparent)] px-4 py-4 last:border-b-0"
          >
            <span className="font-medium">{link.label}</span>
            <ChevronRight size={18} className="text-[var(--tg-hint-color)]" />
          </Link>
        ))}
      </div>
      <LanguageSwitcher />
    </main>
  );
}
