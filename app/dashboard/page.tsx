"use client";

import { ScreenHeader } from "@/components/layout/screen-header";
import { Card } from "@/components/ui/card";
import { useAppStore } from "@/lib/hooks/use-store";
import { getMonthStats } from "@/lib/services/appointments";
import { getCurrentBusiness } from "@/lib/services/businesses";
import { formatPrice } from "@/lib/utils/format";
import { useI18n } from "@/lib/i18n/provider";

export default function DashboardPage() {
  useAppStore();
  const { t } = useI18n();
  const stats = getMonthStats();
  const business = getCurrentBusiness();

  return (
    <main className="pb-8">
      <ScreenHeader title={t.overview} backHref="/more" />
      <div className="grid grid-cols-2 gap-3 px-4">
        <Stat label={t.todayAppointments} value={stats.today} />
        <Stat label={t.upcoming} value={stats.upcoming} />
        <Stat label={t.clients} value={stats.clients} />
        <Stat label={t.thisMonth} value={stats.appointments} />
      </div>
      <div className="mt-4 px-4">
        <Card>
          <p className="text-sm text-[var(--tg-subtitle-text-color)]">{t.thisMonth}</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Mini label={t.completed} value={stats.completed} />
            <Mini label={t.cancelled} value={stats.cancelled} />
            <Mini label={t.noShow} value={stats.noShow} />
            <Mini label={t.revenue} value={formatPrice(stats.revenue, business.currency)} />
          </div>
        </Card>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <div className="text-3xl font-semibold">{value.toLocaleString()}</div>
      <div className="mt-1 text-sm text-[var(--tg-subtitle-text-color)]">{label}</div>
    </Card>
  );
}

function Mini({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <div className="text-xl font-semibold">{value}</div>
      <div className="text-xs text-[var(--tg-subtitle-text-color)]">{label}</div>
    </div>
  );
}
