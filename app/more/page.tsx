"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ScreenHeader } from "@/components/layout/screen-header";
import { Card } from "@/components/ui/card";
import { useAppStore } from "@/lib/hooks/use-store";
import { getCurrentBusiness, getCurrentUser } from "@/lib/services/businesses";
import { BUSINESS_TYPE_LABELS, fullName } from "@/lib/utils/format";

const LINKS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/services", label: "Services" },
  { href: "/staff", label: "Staff" },
  { href: "/messages", label: "Messages" },
  { href: "/settings", label: "Settings" },
  { href: "/clients/import", label: "Import clients" },
];

export default function MorePage() {
  useAppStore();
  const user = getCurrentUser();
  const business = getCurrentBusiness();

  const links =
    process.env.NODE_ENV === "production" ? LINKS : [...LINKS, { href: "/dev", label: "Developer" }];

  return (
    <main className="pb-8 pt-2">
      <ScreenHeader title="More" />
      <Card className="mx-4 mb-5">
        <div className="text-sm text-[var(--tg-subtitle-text-color)]">{BUSINESS_TYPE_LABELS[business.type]}</div>
        <div className="text-xl font-semibold">{business.name}</div>
        <div className="mt-1 text-sm text-[var(--tg-subtitle-text-color)]">{fullName(user)} · Owner</div>
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
    </main>
  );
}
