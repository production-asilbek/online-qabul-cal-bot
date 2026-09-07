"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/provider";

export function ClientSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="relative px-4">
      <Search size={18} className="pointer-events-none absolute left-8 top-1/2 -translate-y-1/2 text-[var(--tg-hint-color)]" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t.search}
        aria-label={t.searchClients}
        className="pl-11"
      />
    </div>
  );
}
